import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema.js';
import { Model } from 'mongoose';
import { CompleteProfileDto } from './dto/users.dto.js';
import { AppRpcException } from '@shared/utils/errors/app-rpc.exception.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async createUserProfile(data: any) {
    const { authId, email } = data;

    await this.usersModel.create({
      authId,
      email,
    });

    return {
      message: 'User Created successfully',
    };
  }

  async completeUserData(
    data: CompleteProfileDto,
    authId: string,
    avatarUrl?: string,
    avatarPublicId?: string,
  ) {
    const { firstName, gender, lastName, phone } = data;
    const user = await this.usersModel.findOneAndUpdate(
      { authId },
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
}
