import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTableLogger1752853552420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_actions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            isUnique: true
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'method',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'user',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'status',
            type: 'int',
            isNullable: true
          },
          {
            name: 'request',
            type: 'text',
            isNullable: true
          },
          {
            name: 'response',
            type: 'text',
            isNullable: true
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_actions');
  }
}
