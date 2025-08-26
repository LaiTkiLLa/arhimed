import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { UserActions } from './entities/user-actions.entity';
import { CreateUserLogs } from './interfaces/create-user-logs.interface';

@Injectable()
export class LoggerService {
  constructor() {}

  async logUserAction(queryRunner: QueryRunner, createUserLogs: CreateUserLogs) {
    const createLog = queryRunner.manager.create(UserActions, {
      method: createUserLogs.method
    });
    await queryRunner.manager.save(UserActions, createLog);
    return;
  }
}
