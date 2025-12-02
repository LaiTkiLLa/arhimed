import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumn1764568139718 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assemblies',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assemblies', 'description');
  }

}
