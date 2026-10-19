import { Controller } from '@nestjs/common';
import { EmailNotificationsService } from './email-notifications.service.js';
import { EventPattern, Payload } from '@nestjs/microservices';
import { type otpPayload } from '@shared/common/types/otp.payload.js';

@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @EventPattern('auth.created')
  async sendOtpEmail(@Payload() data: otpPayload) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }
}
