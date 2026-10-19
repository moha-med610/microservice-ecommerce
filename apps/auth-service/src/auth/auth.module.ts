import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './model/auth.model.js';
import { HashModule } from '../common/modules/hash/hash.module.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-service',
            brokers: ['kafka:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
    TypeOrmModule.forFeature([AuthEntity]),
    TokenModule,
    HashModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
