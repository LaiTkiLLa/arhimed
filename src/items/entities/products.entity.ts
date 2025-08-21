import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ProductAttributesValues } from './product-attributes-values.entity';
import { ProductTypes } from './product-types.entity';

@Entity({
  name: 'products'
})
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'uuid', nullable: false, name: 'type_id' })
  typeId: string;

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

  @ManyToOne(() => ProductTypes, type => type.products)
  @JoinColumn({
    name: 'type_id'
  })
  type: ProductTypes;

  @OneToMany(() => ProductAttributesValues, productTypeAttributeValues => productTypeAttributeValues.product)
  productAttributeValues: ProductAttributesValues[];
}
