import { Module } from '@nestjs/common';
import { EmailNotificationsModule } from './modules/email-notifications/email-notifications.module.js';

@Module({
  imports: [EmailNotificationsModule],
})
export class NotificationsServiceModule {}
