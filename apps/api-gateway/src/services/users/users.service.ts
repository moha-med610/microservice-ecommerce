import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { CompleteProfileDto } from './dto/users.dto.js';
import { CloudinaryService } from '../../common/modules/cloudinary/cloudinary.service.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
    private kafkaRequest: KafkaRequestService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('users.completeProfile');
    this.client.subscribeToResponseOf('users.getProfile');

    await this.client.connect();
  }

  async completeProfile(
    file: Express.Multer.File,
    data: CompleteProfileDto,
    authId: string,
  ) {
    const avatar = await this.cloudinaryService.uploadImage(
      file,
      'users/avatar',
    );
    return this.kafkaRequest.send(this.client, 'users.completeProfile', {
      data,
      authId,
      avatarUrl: avatar.secure_url ?? null,
      avatarPublicId: avatar.public_id ?? null,
    });
  }

  async getProfile(authId: string) {
    return this.kafkaRequest.send(this.client, 'users.getProfile', authId);
  }
}
