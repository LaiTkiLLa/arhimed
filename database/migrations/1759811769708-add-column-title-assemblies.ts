import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnTitleAssemblies1759811769708 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assemblies',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assemblies', 'title');
  }

}
