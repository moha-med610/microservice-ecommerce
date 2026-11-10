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
