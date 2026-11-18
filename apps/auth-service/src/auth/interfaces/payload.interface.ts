import { JwtPayload } from '@shared/common/types/jwt.payload.js';

export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface IGoogleLoginPayload {
  token: string;
}

export interface IResendOtpPayload {
  email: string;
}

export interface IForgetPasswordPayload {
  email: string;
}

export interface IVerifyForgetPasswordOtpPayload {
  email: string;
  otp: string;
}

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
}

export interface IChangePasswordPayload {
  userPayload: JwtPayload;
  data: {
    oldPassword: string;
    newPassword: string;
  };
}
