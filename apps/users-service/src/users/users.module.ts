import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { RedisCacheModule } from '@shared/common/modules/cache/cache.module.js';
import { UsersModel } from './schema/users.schema.js';

@Module({
  imports: [DatabaseModule, RedisCacheModule, UsersModel],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
