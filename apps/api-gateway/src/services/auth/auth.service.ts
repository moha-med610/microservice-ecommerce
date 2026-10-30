import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { JwtPayload } from '@shared/common/types/jwt.payload.js';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  VerifyEmailDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
    private readonly KafkaRequest: KafkaRequestService,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('auth.login');
    this.client.subscribeToResponseOf('auth.register');
    this.client.subscribeToResponseOf('auth.refresh');
    this.client.subscribeToResponseOf('auth.verifyEmail');
    this.client.subscribeToResponseOf('auth.logout');

    await this.client.connect();
  }

  async login(loginData: LoginDto) {
    return this.KafkaRequest.send(this.client, 'auth.login', loginData);
  }

  async register(registerData: RegisterDto) {
    return this.KafkaRequest.send(this.client, 'auth.register', registerData);
  }

  async refreshToken(data: RefreshTokenDto) {
    return this.KafkaRequest.send(this.client, 'auth.refresh', data);
  }

  async verifyEmail(data: VerifyEmailDto) {
    return this.KafkaRequest.send(this.client, 'auth.verifyEmail', data);
  }

  async loginWithGoogle(data: any) {
    return this.KafkaRequest.send(this.client, 'auth.loginWithGoogle', data);
  }

  async logout(data: JwtPayload) {
    return this.KafkaRequest.send(this.client, 'auth.logout', data);
  }

  async resendOtp(data: ResendOtpDto) {
    this.KafkaRequest.emit(this.client, 'auth.resendOtp', data);

    return {
      message: 'Resend Otp Successfully',
      data: {},
    };
  }
}
