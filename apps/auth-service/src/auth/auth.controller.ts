import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service.js';
import {
  AuthDto,
  GoogleTokenDto,
  RefreshTokenDto,
  VerifyEmailDto,
} from './dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() loginData: AuthDto) {
    return await this.authService.login(loginData);
  }

  @MessagePattern('auth.register')
  async register(@Payload() registerData: AuthDto) {
    return await this.authService.register(registerData);
  }

  @MessagePattern('auth.refresh')
  async refreshToken(@Payload() data: RefreshTokenDto) {
    return await this.authService.refreshToken(data);
  }

  @MessagePattern('auth.verifyEmail')
  async verifyEmail(@Payload() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @MessagePattern('auth.loginWithGoogle')
  async loginWithGoogle(@Payload() data: GoogleTokenDto) {
    return this.authService.loginWithGoogle(data);
  }
}
