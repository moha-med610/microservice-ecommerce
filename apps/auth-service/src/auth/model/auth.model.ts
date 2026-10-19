import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ROLES_ENUM } from '@shared/common/enums/roles.enum.js';
import { USER_STATUS_ENUM } from '@shared/common/enums/usersStatus.enum.js';

@Entity({
  name: 'Auth_Model',
})
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  /**
   * 0: CUSTOMER
   * 1: SELLER
   * 2: ADMIN
   * 3: SUPER_ADMIN
   */
  @Column({ type: 'int', enum: ROLES_ENUM, default: ROLES_ENUM.CUSTOMER })
  role: ROLES_ENUM;

  @Column({ type: 'int', default: 0 })
  token_version: number; // for password reset or logout

  @Column({ type: 'boolean', default: false })
  is_verified: boolean; // for email verification

  @Column({ type: 'timestamptz', nullable: true, default: null })
  verified_at: Date | null; // for email verification

  /**
   * 0: ACTIVE
   * 1: INACTIVE
   * 3: BLOCKED
   * 4: DELETED
   */
  @Column({
    type: 'int',
    enum: USER_STATUS_ENUM,
    default: USER_STATUS_ENUM.ACTIVE,
  })
  status: USER_STATUS_ENUM;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
