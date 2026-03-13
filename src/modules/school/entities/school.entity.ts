import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 512, default: '' })
  logoUrl: string;

  @Column({ name: 'primary_color', type: 'varchar', length: 7, default: '#4A90D9' })
  primaryColor: string;

  @Column({ name: 'api_config', type: 'json', nullable: true })
  apiConfig: Record<string, any>;

  @Column({ type: 'tinyint', default: 0, comment: '0=正常 1=停用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
