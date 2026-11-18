export const OTP_KEY = (email: string) => {
  return `user:${email}:OTP`;
};

export const VERIFIED_PASSWORD_OTP_KEY = (email: string): string => {
  return `user:${email}:VERIFIED`;
};
