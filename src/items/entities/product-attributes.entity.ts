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
import { ProductTypes } from './product-types.entity';
import { AttributeValues } from './attribute-values.entity';
import { ProductFieldTypes } from '../../common/enums/products.enum';
import { ProductAttributesValues } from './product-attributes-values.entity';

//Таблица названий свойств товара
@Entity({
  name: 'product_attributes'
})
export class ProductAttributes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'uuid', nullable: false, name: 'type_id' })
  typeId: string;

  //Очередность
  @Column({ type: 'int', nullable: false })
  rank: number;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'is_required'
  })
  isRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    name: 'is_disabled'
  })
  isDisabled: boolean;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'field_type'
  })
  fieldType: ProductFieldTypes;

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

  @ManyToOne(() => ProductTypes, type => type.attributes)
  @JoinColumn({
    name: 'type_id'
  })
  type: ProductTypes;

  @OneToMany(() => AttributeValues, attributeValues => attributeValues.attribute)
  attributeValues: AttributeValues[];

  @OneToMany(
    () => ProductAttributesValues,
    productTypeAttributeValues => productTypeAttributeValues.productAttributeProperty
  )
  productAttributeValues: ProductAttributesValues[];
}
