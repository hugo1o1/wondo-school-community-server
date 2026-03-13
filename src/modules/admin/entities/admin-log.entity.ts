import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_name', type: 'varchar', length: 64 })
  adminName: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  target: string;

  @Column({ type: 'varchar', length: 45, default: '' })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
