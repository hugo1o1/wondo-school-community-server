import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { School } from './school.entity';

@Entity('user_schools')
export class UserSchool {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'school_id', type: 'bigint' })
  schoolId: number;

  @Column({ name: 'student_id', type: 'varchar', length: 32 })
  studentId: string;

  @Column({ name: 'real_name', type: 'varchar', length: 32 })
  realName: string;

  @Column({ name: 'auth_status', type: 'tinyint', default: 0, comment: '0=待审核 1=通过 2=拒绝' })
  authStatus: number;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school: School;
}
