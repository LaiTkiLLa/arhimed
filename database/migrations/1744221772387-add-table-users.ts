import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddTableUsers1744221772387 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'phone',
            type: 'varchar',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'phone_verified',
            type: 'boolean',
            isNullable: false,
            default: false
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'email_verified',
            type: 'boolean',
            isNullable: false,
            default: false
          },
          {
            name: 'password_hash',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'middle_name',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'role_id',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true
          },
          {
            name: 'last_login',
            type: 'timestamptz',
            isNullable: true
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
    new TableForeignKey({
      columnNames: ['role_id'],
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      referencedColumnNames: ['id'],
      referencedTableName: 'roles'
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
