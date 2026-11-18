import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { type Request } from 'express';
import { AuthService } from './auth.service.js';
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
import { userData } from '@shared/utils/extract-user-data.js';

@Throttle({ default: { ttl: 5 * 60 * 1000, limit: 5 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @Post('verify-email')
  async verifyEmail(@Body() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @Post('google')
  async loginWithGoogle(@Body() data: any) {
    return this.authService.loginWithGoogle(data);
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    const data = userData(req);
    return this.authService.logout(data);
  }

  @Throttle({ default: { limit: 1, ttl: 60 * 1000 } })
  @Post('resend-otp')
  async resendOtp(@Body() data: ResendOtpDto) {
    return this.authService.resendOtp(data);
  }

  @Post('forget-password')
  async forgetPassword(@Body() data: ForgetPasswordDto) {
    return this.authService.forgetPassword(data);
  }

  @Post('verify-forget-password')
  async verifyForgetPasswordOtp(@Body() data: VerifyForgetPasswordDto) {
    return this.authService.verifyForgetPasswordOtp(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDto, @Req() req: Request) {
    const userPayload = userData(req);
    return this.authService.changePassword(data, userPayload);
  }
}
