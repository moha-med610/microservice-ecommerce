import { Injectable } from '@nestjs/common';
import { otpPayload } from '@shared/common/types/otp.payload.js';
import { NodemailerService } from '../nodemailer/nodemailer.service.js';
import { otpEmailHtml } from '../../email-templates/otp-email.js';

@Injectable()
export class EmailNotificationsService {
  constructor(private readonly nodemailerService: NodemailerService) {}

  async sendOtpEmail(data: otpPayload) {
    const { email, otp } = data;

    await this.nodemailerService.sendEmail({
      to: email,
      subject: 'OTP',
      html: otpEmailHtml(otp),
    });
  }
}
