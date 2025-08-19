import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ProductAttributes } from './product-attributes.entity';
import { Products } from './products.entity';

//Таблица типов товара
@Entity({
  name: 'product_types'
})
export class ProductTypes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  //Очередность
  @Column({ type: 'int', nullable: false })
  rank: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'created_at',
    default: new Date()
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'updated_at',
    default: new Date()
  })
  updatedAt: Date;

  @OneToMany(() => ProductAttributes, attributes => attributes.type)
  attributes: ProductAttributes[];

  @OneToMany(() => Products, products => products.type)
  products: Products[];
}
