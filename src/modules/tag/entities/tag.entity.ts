import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  name: string;

  @Column({ name: 'school_id', type: 'bigint', nullable: true, comment: 'NULL=通用标签' })
  schoolId: number;

  @Column({ name: 'post_count', type: 'int', default: 0 })
  postCount: number;
}
