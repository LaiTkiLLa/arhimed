import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'products_assemblies'
})
export class ProductsAssemblies {
  @PrimaryColumn({
    nullable: false,
    name: 'product_id',
    type: 'varchar'
  })
  productId: string;

  @PrimaryColumn({
    nullable: false,
    name: 'assembly_id',
    type: 'varchar'
  })
  assemblyId: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'createdAt',
    default: new Date()
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updatedAt',
    default: new Date()
  })
  updatedAt: Date;
}
