import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Products } from './products.entity';
import { ProductAttributes } from './product-attributes.entity';

@Entity({
  name: 'product_attributes_values'
})
export class ProductAttributesValues {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  value: string;

  @Column({ name: 'product_attribute_property_id', type: 'uuid', nullable: false })
  productAttributePropertyId: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId: string;

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

  @ManyToOne(() => Products, product => product.productTypeAttributeValues)
  @JoinColumn({
    name: 'product_id'
  })
  product: Products;

  @ManyToOne(
    () => ProductAttributes,
    productAttributeProperty => productAttributeProperty.productAttributeValues
  )
  @JoinColumn({
    name: 'product_attribute_property_id'
  })
  productAttributeProperty: ProductAttributes;
}
