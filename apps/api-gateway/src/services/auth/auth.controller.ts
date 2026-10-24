import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { AuthDto, RefreshTokenDto, VerifyEmailDto } from './dto/auth.dto.js';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';

@Throttle({ default: { ttl: 5 * 60 * 1000, limit: 5 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: AuthDto) {
    return this.authService.login(loginData);
  }

  @Post('register')
  async register(@Body() registerData: AuthDto) {
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
  @Get('check')
  checkGuard() {
    return {
      success: true,
    };
  }
}
