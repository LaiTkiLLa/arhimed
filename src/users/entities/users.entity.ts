import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Roles } from './roles.entity';

@Entity({
  name: 'users'
})
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phone: string;

  @Column({ type: 'boolean', nullable: false, name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'boolean', nullable: false, name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true, name: 'middle_name' })
  middleName: string;

  @Column({ type: 'boolean', nullable: false, default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'int', nullable: false, name: 'role_id' })
  roleId: number;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'last_login'
  })
  lastLogin: Date;

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

  @OneToOne(() => Roles, role => role.users)
  @JoinColumn({
    name: 'role_id'
  })
  role: Roles;
}
