import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenType } from '@shared/common/enums/tokenType.enum.js';
import { USER_STATUS_ENUM } from '@shared/common/enums/usersStatus.enum.js';
import { RedisCacheService } from '@shared/common/modules/cache/cache.service.js';
import { TokenService } from '@shared/common/modules/token/token.service.js';
import { JwtPayload } from '@shared/common/types/jwt.payload.js';
import { AppRpcException } from '@shared/utils/errors/app-rpc.exception.js';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { AUTH_PROVIDER } from '../common/enums/auth-provider.enum.js';
import { HashService } from '../common/modules/hash/hash.service.js';
import { OTP_KEY } from '../utils/cache-keys.js';
import { OTP_GENERATOR } from '../utils/security/generateOtp.js';
import { tokenPayloadHelper } from '../utils/token-payload-helper.js';
import { userDataHelper } from '../utils/user-data-helper.js';
import {
  GoogleTokenDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  VerifyEmailDto,
} from './dto/auth.dto.js';
import { AuthEntity } from './model/auth.model.js';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepo: Repository<AuthEntity>,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService,
    private readonly redisService: RedisCacheService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly kafkaRequest: KafkaRequestService,
  ) {
    this.googleClient = new OAuth2Client();
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;

    const findUser = await this.authRepo.findOne({ where: { email } });
    if (!findUser) {
      throw new AppRpcException({
        code: 'INVALID_CREDENTIAL',
        message: 'Invalid Email or Password',
        statusCode: 400,
      });
    }

    if (!findUser.password && findUser.provider !== AUTH_PROVIDER.SYSTEM) {
      throw new AppRpcException({
        code: 'BAD_REQUEST',
        statusCode: 400,
        message: 'Try Login With Your Social Account',
      });
    }

    const isCorrectPassword = await this.hashService.compareHash(
      password,
      findUser.password!,
    );
    if (!isCorrectPassword) {
      throw new AppRpcException({
        code: 'INVALID_CREDENTIAL',
        message: 'Invalid Email or Password',
        statusCode: 400,
      });
    }

    const userData = userDataHelper(findUser);

    // create access token
    const accessToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.ACCESS, findUser),
    );

    // create refresh token
    const refreshToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.REFRESH, findUser),
    );

    // return access token and refresh token and user data
    return {
      message: 'Welcome Back!, Your Logged in successfully',
      data: { accessToken, refreshToken, user: userData },
    };
  }

  async register(registerData: RegisterDto) {
    const { email, password } = registerData;

    const findUser = await this.authRepo.findOne({ where: { email } });
    if (findUser) {
      throw new AppRpcException({
        code: 'BAD_REQUEST',
        message: 'User Already Exist',
        statusCode: 400,
      });
    }

    const hashedPassword = await this.hashService.createHash(password);
    const newUser = this.authRepo.create({
      email,
      password: hashedPassword,
    });
    await this.authRepo.save(newUser);

    const otp = OTP_GENERATOR();

    const hashedOtp = await this.hashService.createHash(otp);

    // call send email verification email
    this.kafkaRequest.emit(this.kafkaClient, 'user.created', {
      email: newUser.email,
      otp,
    });

    const userData = userDataHelper(newUser);

    await this.redisService.setData(
      OTP_KEY(newUser.email),
      hashedOtp,
      10 * 60 * 1000,
    );

    return {
      message:
        'User registered successfully, Please Check Your Email To Verify Your Account',
      data: {
        user: userData,
      },
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;

    // Verify the refresh token
    const payload: JwtPayload = await this.tokenService.verifyToken(
      refreshToken,
      TokenType.REFRESH,
    );

    if (!payload) {
      throw new AppRpcException({
        code: 'INVALID_TOKEN',
        statusCode: 401,
        message: 'Invalid Refresh Token',
      });
    }

    if (!payload.exp || Number(payload.exp) * 1000 <= Date.now()) {
      throw new AppRpcException({
        code: 'UNAUTHORIZED',
        statusCode: 401,
        message: 'Token is Expired',
      });
    }
    // Fetch the user using the payload info
    const user = await this.authRepo.findOne({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new AppRpcException({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
        message: 'User not found',
      });
    }

    if (user.status !== USER_STATUS_ENUM.ACTIVE) {
      throw new AppRpcException({
        code: 'USER_INACTIVE',
        statusCode: 403,
        message: 'User is not active',
      });
    }

    // Create new tokens
    const newAccessToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.ACCESS, user),
    );

    const newRefreshToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.REFRESH, user),
    );

    const userData = userDataHelper(user);

    return {
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData,
      },
    };
  }

  async verifyEmail(data: VerifyEmailDto) {
    const { email, otp } = data;

    const cachedOtp = await this.redisService.getData(OTP_KEY(email));
    if (!cachedOtp) {
      throw new AppRpcException({
        code: 'BAD_REQUEST',
        statusCode: 400,
        message: 'OTP is Expired',
      });
    }

    if (!(await this.hashService.compareHash(otp, cachedOtp))) {
      throw new AppRpcException({
        code: 'BAD_REQUEST',
        statusCode: 400,
        message: 'Invalid OTP',
      });
    }

    const user = await this.authRepo.findOne({ where: { email } });
    if (!user) {
      throw new AppRpcException({
        code: 'NOT_FOUND',
        statusCode: 404,
        message: 'User Not Found',
      });
    }

    user.is_verified = true;
    user.verified_at = new Date(Date.now());

    await this.authRepo.save(user);

    await this.redisService.delete(OTP_KEY(email));

    const userData = userDataHelper(user);

    // create access token
    const accessToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.ACCESS, user),
    );

    // create refresh token
    const refreshToken = this.tokenService.createToken(
      tokenPayloadHelper(TokenType.REFRESH, user),
    );

    // send event to create profile data
    this.kafkaClient.emit('auth.verified', user.id);

    return {
      message: 'Congratulation, Your Account Verified successfully',
      data: {
        accessToken,
        refreshToken,
        user: userData,
      },
    };
  }

  async loginWithGoogle(data: GoogleTokenDto) {
    const { token } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: '',
    });

    const googlePayload = ticket.getPayload();

    let user: AuthEntity | null;

    user = await this.authRepo.findOne({
      where: { email: googlePayload?.email },
    });

    let accessToken: string;
    let refreshToken: string;

    if (user) {
      if (user.provider !== AUTH_PROVIDER.GOOGLE) {
        throw new AppRpcException({
          code: 'BAD_REQUEST',
          statusCode: 400,
          message: 'Try Login With Your App Account',
        });
      }

      accessToken = this.tokenService.createToken(
        tokenPayloadHelper(TokenType.ACCESS, user),
      );

      refreshToken = this.tokenService.createToken(
        tokenPayloadHelper(TokenType.REFRESH, user),
      );
    } else {
      user = this.authRepo.create({
        email: googlePayload?.email,
        google_id: googlePayload?.sub,
        provider: AUTH_PROVIDER.GOOGLE,
        is_verified: googlePayload?.email_verified,
        verified_at: new Date(Date.now()),
      });
      await this.authRepo.save(user);

      accessToken = this.tokenService.createToken(
        tokenPayloadHelper(TokenType.ACCESS, user),
      );

      refreshToken = this.tokenService.createToken(
        tokenPayloadHelper(TokenType.REFRESH, user),
      );
    }

    const userData = userDataHelper(user);

    return {
      message: 'Sign With Google successfully',
      data: {
        accessToken,
        refreshToken,
        user: userData,
      },
    };
  }

  async forgetPassword(data: any) {
    const { email } = data;

    // find email

    // generate otp

    // save otp in cache

    // send event forget password

    // return message
  }

  async verifyResetOtp(data: any) {
    const { email, otp } = data;

    // check email

    // check otp in cache
  }

  async changePassword(data: any) {
    const { oldPassword, newPassword, confirmNewPassword } = data;
  }

  async resendOtp(data: ResendOtpDto) {
    const { email } = data;

    const otp = OTP_GENERATOR();
    const hashedOtp = await this.hashService.createHash(otp);

    await this.redisService.setData(OTP_KEY(email), hashedOtp, 10 * 60 * 1000);

    this.kafkaRequest.emit(this.kafkaClient, 'notification.resendOtp', {
      email,
      otp,
    });

    return {
      message: 'Resend Otp successfully',
      data: {},
    };
  }

  async logout(data: JwtPayload) {
    const { jti, exp } = data;

    await this.tokenService.revokeToken(jti, exp);

    return {
      message: 'Your Logged out successfully',
      data: {},
    };
  }
}
