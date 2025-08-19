import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddItemsEntities1755596871297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_types',
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
            name: 'title',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'rank',
            type: 'int',
            isNullable: false
          },
          {
            name: 'description',
            type: 'varchar',
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
    await queryRunner.createTable(
      new Table({
        name: 'products',
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
            name: 'title',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'type_id',
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
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['type_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            referencedColumnNames: ['id'],
            referencedTableName: 'product_types'
          })
        ]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'product_attributes',
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
            name: 'title',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'type_id',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'rank',
            type: 'int',
            isNullable: false
          },
          {
            name: 'is_required',
            type: 'boolean',
            isNullable: false
          },
          {
            name: 'is_disabled',
            type: 'boolean',
            isNullable: false
          },
          {
            name: 'field_type',
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
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['type_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            referencedColumnNames: ['id'],
            referencedTableName: 'product_types'
          })
        ]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'product_type_attributes_values',
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
            name: 'value',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'product_id',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'product_attribute_property_id',
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
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['product_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            referencedColumnNames: ['id'],
            referencedTableName: 'products'
          }),
          new TableForeignKey({
            columnNames: ['product_attribute_property_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            referencedColumnNames: ['id'],
            referencedTableName: 'product_attributes'
          })
        ]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'attribute_values',
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
            name: 'value',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'attribute_id',
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
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['attribute_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            referencedColumnNames: ['id'],
            referencedTableName: 'product_attributes'
          })
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attribute_values');
    await queryRunner.dropTable('product_type_attributes_values');
    await queryRunner.dropTable('product_attributes');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('product_types');
  }
}
