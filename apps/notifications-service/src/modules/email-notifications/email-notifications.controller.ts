import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailNotificationsService } from './email-notifications.service.js';
import type { IOtpPayload } from './interfaces/payload.interface.js';

@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @EventPattern('user.created')
  async sendOtpEmail(@Payload() data: IOtpPayload) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }

  @EventPattern('notification.resendOtp')
  async resendOtp(@Payload() data: IOtpPayload) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }
}
