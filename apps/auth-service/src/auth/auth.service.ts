import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashService } from '../common/modules/hash/hash.service.js';
import {
  AuthDto,
  GoogleTokenDto,
  RefreshTokenDto,
  VerifyEmailDto,
} from './dto/auth.dto.js';
import { AuthEntity } from './model/auth.model.js';
import { TokenService } from '@shared/common/modules/token/token.service.js';
import { AppRpcException } from '@shared/utils/errors/app-rpc.exception.js';
import { TokenType } from '@shared/common/enums/tokenType.enum.js';
import { USER_STATUS_ENUM } from '@shared/common/enums/usersStatus.enum.js';
import { ClientKafka } from '@nestjs/microservices';
import { OTP } from '../utils/security/generateOtp.js';
import { type Cache } from 'cache-manager';
import { OTP_KEY } from '../utils/cache-keys.js';
import { AUTH_PROVIDER } from '../common/enums/auth-provider.enum.js';
import { OAuth2Client } from 'google-auth-library';
import { userDataHelper } from '../utils/user-data-helper.js';
import { tokenPayloadHelper } from '../utils/token-payload-helper.js';
import { JwtPayload } from '@shared/common/types/jwt.payload.js';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepo: Repository<AuthEntity>,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @Inject('CACHE_MANAGER') private cacheManger: Cache,
  ) {
    this.googleClient = new OAuth2Client();
  }

  async login(loginData: AuthDto) {
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

  async register(registerData: AuthDto) {
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

    // call send email verification email
    this.kafkaClient.emit('auth.created', {
      email: newUser.email,
      otp: OTP,
    });

    await this.cacheManger.set(OTP_KEY(newUser.email), OTP, 5 * 60 * 1000);

    return {
      message:
        'User registered successfully, Please Follow Your Email To Verify Your Account',
      data: {},
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

    const cachedOtp = await this.cacheManger.get(OTP_KEY(email));
    if (!cachedOtp) {
      throw new AppRpcException({
        code: 'BAD_REQUEST',
        statusCode: 400,
        message: 'OTP is Expired',
      });
    }

    if (cachedOtp !== otp) {
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

    await this.cacheManger.del(OTP_KEY(email));

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
}
