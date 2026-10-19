import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { KafkaRequestService } from '@shared/utils/errors/kafka-request-helper.js';

@Module({
  imports: [
    JwtModule.register({}),
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
