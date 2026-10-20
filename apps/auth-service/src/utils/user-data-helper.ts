import { AuthEntity } from '../auth/model/auth.model.js';

export const userDataHelper = (user: AuthEntity) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    is_verified: user.is_verified,
    verified_at: user.verified_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};
