import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppRpcException } from '@shared/utils/errors/app-rpc.exception.js';
import { Model } from 'mongoose';
import {
  ICompleteUserProfile,
  ICreateUserProfile,
} from './interfaces/payload.interface.js';
import { Users } from './schema/users.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async createUserProfile(data: ICreateUserProfile) {
    const { authId, email } = data;

    await this.usersModel.create({
      authId,
      email,
    });

    return {
      message: 'User Created successfully',
    };
  }

  async completeUserData(payload: ICompleteUserProfile) {
    const { firstName, gender, lastName, phone } = payload.data;
    const { authId, avatarPublicId, avatarUrl } = payload;
    const user = await this.usersModel.findOneAndUpdate(
      { authId: authId },
      {
        firstName,
        lastName,
        gender,
        avatarUrl,
        avatarPublicId,
        phones: phone,
      },
      { returnDocument: 'after' },
    );
    if (!user) {
      throw new AppRpcException({
        code: 'NOT_FOUND',
        statusCode: 404,
        message: 'User Not Found',
      });
    }

    return {
      message: 'Your Completed Your Profile Data successfully',
      data: {
        user,
      },
    };
  }

  async getUserProfile(authId: string) {
    const user = await this.usersModel.findOne({ authId });
    if (!user) {
      throw new AppRpcException({
        code: 'NOT_FOUND',
        statusCode: 404,
        message: 'User Not Found',
      });
    }

    return {
      message: 'User Profile Data fetched successfully',
      data: {
        user,
      },
    };
  }
}
