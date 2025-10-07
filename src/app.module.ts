import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtGuard } from './common/guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { LoggerModule } from './logger/logger.module';
import { ItemsModule } from './items/items.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AssembliesModule } from './assemblies/assemblies.module';
import { PublicItemsModule } from './public/items/public-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration]
    }),
    CacheModule.register({
      isGlobal: true
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): Promise<TypeOrmModuleOptions> =>
        configService.get('database'),
      inject: [ConfigService]
    }),
    UsersModule,
    MailModule,
    LoggerModule,
    ItemsModule,
    AssembliesModule,
    PublicItemsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    }
  ]
})
export class AppModule {}
