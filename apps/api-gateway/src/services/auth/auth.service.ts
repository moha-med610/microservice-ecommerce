import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { JwtPayload } from '@shared/common/types/jwt.payload.js';
import { RequestService } from '@shared/utils/errors/kafka-request-helper.js';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyForgetPasswordDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly tcpClient: ClientProxy,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly requestService: RequestService,
  ) {}

  async login(loginData: LoginDto) {
    return this.requestService.send(this.tcpClient, 'auth.login', loginData);
  }

  async register(registerData: RegisterDto) {
    return this.requestService.send(
      this.tcpClient,
      'auth.register',
      registerData,
    );
  }

  async refreshToken(data: RefreshTokenDto) {
    return this.requestService.send(this.tcpClient, 'auth.refresh', data);
  }

  async verifyEmail(data: VerifyEmailDto) {
    return this.requestService.send(this.tcpClient, 'auth.verifyEmail', data);
  }

  async loginWithGoogle(data: any) {
    return this.requestService.send(
      this.tcpClient,
      'auth.loginWithGoogle',
      data,
    );
  }

  async logout(data: JwtPayload) {
    return this.requestService.send(this.tcpClient, 'auth.logout', data);
  }

  async resendOtp(data: ResendOtpDto) {
    this.requestService.emit(this.kafkaClient, 'auth.resendOtp', data);

    return {
      message: 'Resend Otp Successfully',
      data: {},
    };
  }

  async forgetPassword(data: ForgetPasswordDto) {
    return this.requestService.send(
      this.tcpClient,
      'auth.forgetPassword',
      data,
    );
  }

  async verifyForgetPasswordOtp(data: VerifyForgetPasswordDto) {
    return this.requestService.send(
      this.tcpClient,
      'auth.verifyForgetPassword',
      data,
    );
  }

  async resetPassword(data: ResetPasswordDto) {
    return this.requestService.send(this.tcpClient, 'auth.resetPassword', data);
  }

  async changePassword(data: ChangePasswordDto, userPayload: JwtPayload) {
    return this.requestService.send(this.tcpClient, 'auth.changePassword', {
      userPayload,
      data,
    });
  }
}
