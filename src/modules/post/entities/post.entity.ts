import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PostImage } from './post-image.entity';
import { PostTag } from './post-tag.entity';

@Entity('posts')
@Index('idx_school_created', ['schoolId', 'createdAt'])
@Index('idx_user', ['userId'])
@Index('idx_review_status', ['reviewStatus'])
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'school_id', type: 'bigint' })
  schoolId: number;

  @Column({ type: 'tinyint', comment: '1=纯文字 2=图文' })
  type: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '文字模板 A/B/C' })
  template: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'collect_count', type: 'int', default: 0 })
  collectCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'review_status', type: 'tinyint', default: 0, comment: '0=待审核 1=通过 2=拒绝' })
  reviewStatus: number;

  @Column({ name: 'review_reason', type: 'varchar', length: 500, nullable: true })
  reviewReason: string;

  @Column({ type: 'tinyint', default: 0, comment: '0=正常 1=删除' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  author: User;

  @OneToMany(() => PostImage, (image) => image.post)
  images: PostImage[];

  @OneToMany(() => PostTag, (postTag) => postTag.post)
  postTags: PostTag[];
}
