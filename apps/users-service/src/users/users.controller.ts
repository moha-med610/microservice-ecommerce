import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import type {
  ICompleteUserProfile,
  ICreateUserProfile,
  IGetUserProfile,
} from './interfaces/payload.interface.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('auth.verified')
  async createUserProfile(@Payload() data: ICreateUserProfile) {
    return this.usersService.createUserProfile(data);
  }

  @MessagePattern('users.completeProfile')
  async completeUserProfile(
    @Payload()
    payload: ICompleteUserProfile,
  ) {
    return this.usersService.completeUserData(payload);
  }

  @MessagePattern('users.getProfile')
  async getUserProfile(@Payload() payload: IGetUserProfile) {
    return this.usersService.getUserProfile(payload.authId);
  }
}
