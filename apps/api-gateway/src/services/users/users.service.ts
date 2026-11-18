import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { RequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { CompleteProfileDto } from './dto/users.dto.js';
import { CloudinaryService } from '../../common/modules/cloudinary/cloudinary.service.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_SERVICE') private readonly tcpClient: ClientProxy,
    private requestService: RequestService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async completeProfile(
    file: Express.Multer.File,
    data: CompleteProfileDto,
    authId: string,
  ) {
    const avatar = await this.cloudinaryService.uploadImage(
      file,
      'users/avatar',
    );
    return this.requestService.send(this.tcpClient, 'users.completeProfile', {
      data,
      authId,
      avatarUrl: avatar.secure_url ?? null,
      avatarPublicId: avatar.public_id ?? null,
    });
  }

  async getProfile(authId: string) {
    return this.requestService.send(this.tcpClient, 'users.getProfile', {
      authId,
    });
  }
}
