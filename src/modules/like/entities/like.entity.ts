import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, Index } from 'typeorm';

@Entity('likes')
@Unique('uk_user_post', ['userId', 'postId'])
@Index('idx_post', ['postId'])
export class Like {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'post_id', type: 'bigint' })
  postId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
