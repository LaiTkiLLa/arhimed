import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTableRoles1744221593505 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'uuid',
            isNullable: false,
            type: 'varchar',
            generationStrategy: 'uuid',
            generatedIdentity: 'ALWAYS',
            isPrimary: true,
            isGenerated: true,
            isUnique: true
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
