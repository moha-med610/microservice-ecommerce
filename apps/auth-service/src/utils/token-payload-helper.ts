import { TokenType } from '@shared/common/enums/tokenType.enum.js';
import { AuthEntity } from '../auth/model/auth.model.js';
import { JwtPayload } from '@shared/common/types/jwt.payload.js';

export const tokenPayloadHelper = (
  tokenType: TokenType,
  user: AuthEntity,
): JwtPayload => {
  return {
    type: TokenType.ACCESS,
    id: user.id,
    email: user.email,
    status: user.status,
    role: user.role,
    token_version: user.token_version,
    isVerified: user.is_verified,
  };
};
