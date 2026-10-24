import { Injectable } from '@nestjs/common';
import { NodemailerService } from '../nodemailer/nodemailer.service.js';
import { otpEmailHtml } from '../../email-templates/otp-email.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

@Injectable()
export class EmailNotificationsService {
  constructor(private readonly nodemailerService: NodemailerService) {}

  async sendOtpEmail(data: VerifyEmailDto) {
    const { email, otp } = data;

    await this.nodemailerService.sendEmail({
      to: email,
      subject: 'OTP',
      html: otpEmailHtml(otp),
    });
  }
}
