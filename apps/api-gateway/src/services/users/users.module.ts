import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';
import { CloudinaryModule } from '../../common/modules/cloudinary/cloudinary.module.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'users-service',
            brokers: ['kafka:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          consumer: {
            groupId: 'users-service-consumer',
          },
        },
      },
    ]),
    TokenModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard, KafkaRequestService],
})
export class UsersModule {}
