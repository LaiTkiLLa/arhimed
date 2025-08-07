import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ProductAttributes } from './product-attributes.entity';

//Таблица возможных значений свойств товара
@Entity({
  name: 'attribute_values'
})
export class AttributeValues {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  value: string;

  @Column({ type: 'uuid', nullable: false, name: 'attribute_id' })
  attributeId: string;

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

  @ManyToOne(() => ProductAttributes, attribute => attribute.attributeValues)
  @JoinColumn({
    name: 'attribute_id'
  })
  attribute: ProductAttributes;
}
