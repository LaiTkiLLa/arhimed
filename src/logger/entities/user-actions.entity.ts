import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'user_actions'
})
export class UserActions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'varchar'
  })
  method: string;

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
}
