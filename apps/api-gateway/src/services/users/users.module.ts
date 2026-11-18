import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { RequestService } from '@shared/utils/errors/kafka-request-helper.js';
import { TokenModule } from '@shared/common/modules/token/token.module.js';
import { CloudinaryModule } from '../../common/modules/cloudinary/cloudinary.module.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'users-service',
          port: 3002,
        },
      },
    ]),
    TokenModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard, RequestService],
})
export class UsersModule {}
