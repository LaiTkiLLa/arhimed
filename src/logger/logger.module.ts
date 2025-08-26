import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActions } from './entities/user-actions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActions])],
  providers: [LoggerService],
  exports: [LoggerService]
})
export class LoggerModule {}
