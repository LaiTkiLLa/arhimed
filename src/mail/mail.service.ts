import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async sendMailCode(email: string, code: number) {
    return this.mailerService.sendMail({
      to: email,
      from: this.configService.get('mailer.transport.auth.user'),
      subject: 'Код авторизации Arhimed.tech',
      html: `<b>Ваш код авторизации ${code}</b>` // HTML body content
    });
  }

  async sendVerificationLink(email: string, user: Users, role: string) {
    const token = await this.generateMailToken({ email, id: user.id });
    const url = this.configService.get('mailerJwt.emailConfirmationEmail');
    await this.mailerService.sendMail({
      to: email,
      from: this.configService.get('mailer.transport.auth.user'),
      subject: 'Регистрация Arhimed.tech',
      template: 'registry',
      context: {
        name: user.firstName,
        role,
        verificationLink: `${url}?token=${token}`
      }
    });
  }

  async generateMailToken(payload: { email: string; id: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('mailerJwt.secret'),
      expiresIn: this.configService.get<string>('mailerJwt.signOptions.expiresIn')
    });
  }

  async decodeMailToken(token: string): Promise<{ email: string; id: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('mailerJwt.secret'),
      ignoreExpiration: false
    });
  }
}
