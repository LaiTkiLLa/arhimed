import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewColumns1764946013385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_attributes',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
    await queryRunner.addColumn(
      'attribute_values',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
    await queryRunner.addColumn(
      'product_types',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
    await queryRunner.addColumn(
      'product_attributes_values',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product_attributes', 'deleted_at');
    await queryRunner.dropColumn('attribute_values', 'deleted_at');
    await queryRunner.dropColumn('attribute_values', 'product_types');
    await queryRunner.dropColumn('attribute_values', 'product_attributes_values');
  }
}
