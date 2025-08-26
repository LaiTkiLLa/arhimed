import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'user_actions'
})
export class UserActions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'varchar', nullable: true })
  user: string;

  @Column({ type: 'int', nullable: true })
  status: number;

  @Column({ type: 'text', nullable: true })
  request: string;

  @Column({ type: 'text', nullable: true })
  response: string;

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
