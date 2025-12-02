import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewColumns1764650756685 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
    await queryRunner.addColumn(
      'products_assemblies',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'deleted_at');
    await queryRunner.dropColumn('products_assemblies', 'deleted_at');
  }

}
