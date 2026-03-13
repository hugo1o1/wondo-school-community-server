import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  unionid: string;

  @Column({ type: 'varchar', length: 32, default: '' })
  nickname: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 512, default: '' })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  bio: string;

  @Column({ type: 'tinyint', default: 0, comment: '0=正常 1=禁用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
