import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { type JwtPayload } from '@shared/common/types/jwt.payload.js';
import { AuthService } from './auth.service.js';
import type {
  IAuthPayload,
  IGoogleLoginPayload,
  IRefreshTokenPayload,
  IResendOtpPayload,
  IVerifyEmailPayload,
} from './interfaces/payload.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() loginData: IAuthPayload) {
    return await this.authService.login(loginData);
  }

  @MessagePattern('auth.register')
  async register(@Payload() registerData: IAuthPayload) {
    return await this.authService.register(registerData);
  }

  @MessagePattern('auth.refresh')
  async refreshToken(@Payload() data: IRefreshTokenPayload) {
    return await this.authService.refreshToken(data);
  }

  @MessagePattern('auth.verifyEmail')
  async verifyEmail(@Payload() data: IVerifyEmailPayload) {
    return this.authService.verifyEmail(data);
  }

  @MessagePattern('auth.loginWithGoogle')
  async loginWithGoogle(@Payload() data: IGoogleLoginPayload) {
    return this.authService.loginWithGoogle(data);
  }

  @MessagePattern('auth.forgetPassword')
  async forgetPassword(@Payload() data: any) {
    return this.authService.forgetPassword(data);
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() data: JwtPayload) {
    return this.authService.logout(data);
  }

  @EventPattern('auth.resendOtp')
  async resendOtp(@Payload() data: IResendOtpPayload) {
    return this.authService.resendOtp(data);
  }
}
