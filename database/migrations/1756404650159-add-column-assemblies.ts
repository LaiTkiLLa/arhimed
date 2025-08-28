import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnAssemblies1756404650159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assemblies',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assemblies', 'deleted_at');
  }
}
