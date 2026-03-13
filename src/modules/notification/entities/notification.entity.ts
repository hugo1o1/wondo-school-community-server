import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
@Index('idx_user_read', ['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ type: 'varchar', length: 20, comment: 'like/comment/system' })
  type: string;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column({ name: 'related_post_id', type: 'bigint', nullable: true })
  relatedPostId: number | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
