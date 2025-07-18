import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LoggerService {
  constructor(private dataSource: DataSource) {}
}
