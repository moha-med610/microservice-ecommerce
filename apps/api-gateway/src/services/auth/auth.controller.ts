import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { type Request } from 'express';
import { AuthService } from './auth.service.js';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  VerifyEmailDto,
} from './dto/auth.dto.js';

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
    return this.authService.logout(req['user']);
  }

  @UseGuards(AuthGuard)
  @Get('check')
  check() {
    return 'OK';
  }

  @Throttle({ default: { limit: 1, ttl: 60 * 1000 } })
  @Post('resend-otp')
  async resendOtp(@Body() data: ResendOtpDto) {
    return this.authService.resendOtp(data);
  }
}
