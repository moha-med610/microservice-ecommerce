import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service.js';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
    }),
  ],
  providers: [NodemailerService],
})
export class NodemailerModule {}
