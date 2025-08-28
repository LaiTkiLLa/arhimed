import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddTableProductsAssembly1756232176415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'assemblies',
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
    await queryRunner.createTable(
      new Table({
        name: 'products_assemblies',
        columns: [
          {
            name: 'product_id',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'assembly_id',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false
          }
        ]
      }),
      true
    );

    // Создаем составной первичный ключ (если нужно)
    await queryRunner.createPrimaryKey('products_assemblies', ['product_id', 'assembly_id']);

    // Внешние ключи
    await queryRunner.createForeignKey(
      'products_assemblies',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id']
      })
    );

    await queryRunner.createForeignKey(
      'products_assemblies',
      new TableForeignKey({
        columnNames: ['assembly_id'],
        referencedTableName: 'assemblies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'article');
    await queryRunner.dropTable('products_assemblies');
    await queryRunner.dropTable('assemblies');
  }
}
