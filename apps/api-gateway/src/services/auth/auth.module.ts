import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';

@Module({
  imports: [
    TokenModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: ['kafka:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, KafkaRequestService],
})
export class AuthModule {}
