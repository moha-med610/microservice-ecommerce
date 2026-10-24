import { Controller } from '@nestjs/common';
import { EmailNotificationsService } from './email-notifications.service.js';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @EventPattern('auth.created')
  async sendOtpEmail(@Payload() data: VerifyEmailDto) {
    return this.emailNotificationsService.sendOtpEmail(data);
  }
}
