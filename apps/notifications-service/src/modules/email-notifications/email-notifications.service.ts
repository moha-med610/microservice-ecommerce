import { Injectable } from '@nestjs/common';
import { NodemailerService } from '../nodemailer/nodemailer.service.js';
import { otpEmailHtml } from '../../email-templates/otp-email.js';
import { IOtpPayload } from './interfaces/payload.interface.js';

@Injectable()
export class EmailNotificationsService {
  constructor(private readonly nodemailerService: NodemailerService) {}

  async sendOtpEmail(data: IOtpPayload) {
    const { email, otp } = data;

    await this.nodemailerService.sendEmail({
      to: email,
      subject: 'OTP',
      html: otpEmailHtml(otp),
    });
  }
}
