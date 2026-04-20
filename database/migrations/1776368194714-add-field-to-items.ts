import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldToItems1776368194714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_attributes',
      new TableColumn({
        name: 'deleted_by_admin_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product_types', 'deleted_by_admin_at');
  }
}
