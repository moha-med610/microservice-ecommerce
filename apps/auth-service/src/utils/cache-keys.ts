export const OTP_KEY = (email: string) => {
  return `user:${email}:OTP`;
};
