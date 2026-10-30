import { Match } from '@shared/common/decorators/match.decorator.js';
import {
  IsEmail,
  IsJWT,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password!: string;

  @Match('password', { message: 'Password Do Not Match' })
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}

export class RefreshTokenDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken!: string;
}

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;
}

export class GoogleTokenDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ResendOtpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
