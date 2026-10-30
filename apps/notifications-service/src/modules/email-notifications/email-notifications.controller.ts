import { Controller } from '@nestjs/common';
import { EmailNotificationsService } from './email-notifications.service.js';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @EventPattern('user.created')
  async sendOtpEmail(@Payload() data: VerifyEmailDto) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }

  @EventPattern('notification.resendOtp')
  async resendOtp(@Payload() data: VerifyEmailDto) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }
}
