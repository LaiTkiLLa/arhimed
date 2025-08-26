import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddTableProductsAssembly1756232176415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_assemblies',
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
            name: 'article',
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
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'article',
        type: 'varchar',
        isNullable: false
      })
    );
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'assembly_id',
        type: 'varchar',
        isNullable: true
      })
    );
    new TableForeignKey({
      columnNames: ['assembly_id'],
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
      referencedColumnNames: ['id'],
      referencedTableName: 'product_assemblies'
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'article');
    await queryRunner.dropColumn('products', 'assembly_id');
    await queryRunner.dropTable('product_assemblies');
  }
}
