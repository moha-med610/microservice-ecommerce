import { Controller } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CompleteProfileDto } from './dto/users.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('auth.verified')
  async createUserProfile(@Payload() data: any) {
    return this.usersService.createUserProfile(data);
  }

  @MessagePattern('users.completeProfile')
  async completeUserProfile(
    @Payload()
    payload: {
      data: CompleteProfileDto;
      authId: string;
      avatarUrl?: string;
      avatarPublicId?: string;
    },
  ) {
    return this.usersService.completeUserData(
      payload.data,
      payload.authId,
      payload.avatarUrl,
      payload.avatarPublicId,
    );
  }
}
