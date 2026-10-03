import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';

@Entity('users')
@Unique('UQ_users_email', ['email'])
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  updatedAt!: Date;
}
