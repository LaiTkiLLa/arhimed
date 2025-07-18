import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async sendVerificationLink(email: string, id: string) {
    const token = this.generateMailToken({ email, id });
    const url = this.configService.get('mailerJwt.emailConfirmationEmail');
    await this.mailerService.sendMail({
      to: email,
      from: 'no_reply@solber.ru',
      subject: 'Подтверждение аккаунта Arhimed.tech',
      text: `Добро пожаловать. Для подтверждения email адреса, кликните по ссылке ${url}?token=${token}`,
      html: '<b>welcome</b>' // HTML body content
    });
  }

  async generateMailToken(payload: { email: string; id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('mailerJwt.secret'),
      expiresIn: this.configService.get<string>('jwt.signOptions.expiresIn')
    });
  }

  async decodeMailToken(token: string): Promise<{ email: string; id: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('mailerJwt.secret'),
      ignoreExpiration: false
    });
  }
}
