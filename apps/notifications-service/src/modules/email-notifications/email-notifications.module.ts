import { Module } from '@nestjs/common';
import { EmailNotificationsService } from './email-notifications.service.js';
import { EmailNotificationsController } from './email-notifications.controller.js';
import { NodemailerModule } from '../nodemailer/nodemailer.module.js';
import { NodemailerService } from '../nodemailer/nodemailer.service.js';

@Module({
  imports: [NodemailerModule],
  controllers: [EmailNotificationsController],
  providers: [EmailNotificationsService, NodemailerService],
})
export class EmailNotificationsModule {}
