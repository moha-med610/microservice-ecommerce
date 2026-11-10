import { CompleteProfileDto } from '../dto/users.dto.js';

export interface ICreateUserProfile {
  authId: string;
  email: string;
}

export interface ICompleteUserProfile {
  data: CompleteProfileDto;
  authId: string;
  avatarUrl?: string;
  avatarPublicId?: string;
}

export interface IGetUserProfile {
  authId: string;
}
