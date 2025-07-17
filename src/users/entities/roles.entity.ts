import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Users } from './users.entity';
import { UserRoles } from '../../common/enums/roles.enum';

@Entity({
  name: 'roles'
})
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: UserRoles;

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

  @OneToOne(() => Users, users => users.role)
  users: Users[];
}
