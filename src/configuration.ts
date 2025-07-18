import * as process from 'process';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const configuration = () => ({
  serverPort: process.env.PORT,

  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    logging: false,
    entities: ['dist/**/*.entity{.ts,.js}']
  },

  jwt: {
    secret: process.env.JWT_ACCESS_SECRET,
    signOptions: { expiresIn: process.env.EXPIRES_IN }
  },

  mailerJwt: {
    secret: process.env.MAILER_JWT_ACCESS_SECRET,
    signOptions: { expiresIn: process.env.MAILER_JWT_EXPIRES_IN },
    emailConfirmationEmail: process.env.EMAIL_CONFIRMATION_URL
  },

  mailer: {
    transport: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      // auth: {
      //   user: process.env.EMAIL_USER,
      //   pass: process.env.EMAIL_PASSWORD
      // },
      tls: {
        rejectUnauthorized: false
      }
    },
    defaults: {
      from: 'no_reply@solber.ru'
    },
    template: {
      dir: __dirname + process.env.TEMPLATES_PATH,
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true
      }
    }
  }
});
