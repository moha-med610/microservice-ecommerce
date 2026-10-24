import { ROLES_ENUM } from '../enums/roles.enum.js';
import { TokenType } from '../enums/tokenType.enum.js';
import { USER_STATUS_ENUM } from '../enums/usersStatus.enum.js';

export type UserTokenData = {
  type: TokenType;
  id: string;
  email: string;
  role: ROLES_ENUM;
  status: USER_STATUS_ENUM;
  token_version: number;
  isVerified: boolean;
};
