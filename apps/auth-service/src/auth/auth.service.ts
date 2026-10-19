import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashService } from '../common/modules/hash/hash.service.js';
import { AuthDto, RefreshTokenDto, VerifyEmailDto } from './dto/auth.dto.js';
import { AuthEntity } from './model/auth.model.js';
import { TokenService } from '@shared/common/modules/token/token.service.js';
import { AppRpcException } from '@shared/utils/errors/app-rpc.exception.js';
import { TokenType } from '@shared/common/enums/tokenType.enum.js';
import { USER_STATUS_ENUM } from '@shared/common/enums/usersStatus.enum.js';
import { ClientKafka } from '@nestjs/microservices';
import { OTP } from '../utils/security/generateOtp.js';
import { type Cache } from 'cache-manager';
import { OTP_KEY } from '../utils/cache-keys.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepo: Repository<AuthEntity>,
    private readonly tokenService: TokenService,
    private readonly hashService: HashService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @Inject('CACHE_MANAGER') private cacheManger: Cache,
  ) {}

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

    const isCorrectPassword = await this.hashService.compareHash(
      password,
      findUser.password,
    );
    if (!isCorrectPassword) {
      throw new AppRpcException({
        code: 'INVALID_CREDENTIAL',
        message: 'Invalid Email or Password',
        statusCode: 400,
      });
    }

    const userData = {
      id: findUser.id,
      email: findUser.email,
      role: findUser.role,
      status: findUser.status,
      is_verified: findUser.is_verified,
      verified_at: findUser.verified_at,
      created_at: findUser.created_at,
      updated_at: findUser.updated_at,
    };

    // create access token
    const accessToken = this.tokenService.createToken({
      type: TokenType.ACCESS,
      id: findUser.id,
      email: findUser.email,
      status: findUser.status,
      role: findUser.role,
      token_version: findUser.token_version,
      isVerified: findUser.is_verified,
    });

    // create refresh token
    const refreshToken = this.tokenService.createToken({
      type: TokenType.REFRESH,
      id: findUser.id,
      email: findUser.email,
      status: findUser.status,
      role: findUser.role,
      token_version: findUser.token_version,
      isVerified: findUser.is_verified,
    });

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

    const userData = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      is_verified: newUser.is_verified,
      verified_at: newUser.verified_at,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    // create access token
    const accessToken = this.tokenService.createToken({
      type: TokenType.ACCESS,
      id: newUser.id,
      email: newUser.email,
      status: newUser.status,
      role: newUser.role,
      token_version: newUser.token_version,
      isVerified: newUser.is_verified,
    });

    // create refresh token
    const refreshToken = this.tokenService.createToken({
      type: TokenType.REFRESH,
      id: newUser.id,
      email: newUser.email,
      status: newUser.status,
      role: newUser.role,
      token_version: newUser.token_version,
      isVerified: newUser.is_verified,
    });

    return {
      message: 'User registered successfully',
      data: { accessToken, refreshToken, user: userData },
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;

    // Verify the refresh token
    const payload = this.tokenService.verifyToken(
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
    const newAccessToken = this.tokenService.createToken({
      type: TokenType.ACCESS,
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
      token_version: user.token_version,
      isVerified: user.is_verified,
    });

    const newRefreshToken = this.tokenService.createToken({
      type: TokenType.REFRESH,
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
      token_version: user.token_version,
      isVerified: user.is_verified,
    });

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

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

    await this.authRepo.update(
      { id: user.id },
      { is_verified: true, verified_at: new Date(Date.now()) },
    );

    await this.cacheManger.del(OTP_KEY(email));

    // send event to create profile data
    this.kafkaClient.emit('auth.verified', user.id);

    return {
      message: 'Congratulation, Your Account Verified successfully',
      data: {},
    };
  }
}
