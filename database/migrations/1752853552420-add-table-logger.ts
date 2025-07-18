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
          { name: 'method', type: 'varchar', isNullable: false }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_actions');
  }
}
