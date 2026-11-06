import { JwtPayload } from '@shared/common/types/jwt.payload.js';
import { Request } from 'express';

export const userData = (req: Request): JwtPayload => req.user;
