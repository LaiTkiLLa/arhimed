import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationLink(email: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com', // sender address
      subject: 'Подтверждение аккаунта Arhimed.tech',
      text: 'welcome',
      html: '<b>welcome</b>' // HTML body content
    });
  }
}
