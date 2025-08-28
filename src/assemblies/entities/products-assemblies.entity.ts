import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({
    type: 'int',
    nullable: false
  })
  quantity: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
    default: new Date()
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
    default: new Date()
  })
  updatedAt: Date;
}
