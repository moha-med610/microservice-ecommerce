import { TokenType } from '@shared/common/enums/tokenType.enum.js';
import { UserTokenData } from '@shared/common/types/token-data.js';
import { AuthEntity } from '../auth/model/auth.model.js';

export const tokenPayloadHelper = (
  tokenType: TokenType,
  user: AuthEntity,
): UserTokenData => {
  return {
    type: tokenType,
    id: user.id,
    email: user.email,
    status: user.status,
    role: user.role,
    token_version: user.token_version,
    isVerified: user.is_verified,
  };
};
