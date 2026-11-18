export interface ICreateUserProfile {
  authId: string;
  email: string;
}

export interface ICompleteUserProfile {
  data: {
    firstName: string;
    lastName: string;
    gender: string;
    phone: string[];
  };
  authId: string;
  avatarUrl?: string;
  avatarPublicId?: string;
}

export interface IGetUserProfile {
  authId: string;
}
