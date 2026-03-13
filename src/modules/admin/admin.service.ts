import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as LikeOp, Between } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Admin } from './entities/admin.entity';
import { AdminLog } from './entities/admin-log.entity';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Tag } from '../tag/entities/tag.entity';
import { School } from '../school/entities/school.entity';
import { Notification } from '../notification/entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    @InjectRepository(AdminLog) private readonly logRepo: Repository<AdminLog>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== Auth ====================

  async login(username: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (admin.status === 1) {
      throw new UnauthorizedException('账号已被禁用');
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const token = this.jwtService.sign({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin',
    });
    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        nickname: admin.nickname,
      },
    };
  }

  async getProfile(adminId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('管理员不存在');
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      nickname: admin.nickname,
    };
  }

  // ==================== Dashboard ====================

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayUsers, todayPosts, todayComments] = await Promise.all([
      this.userRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.postRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.commentRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
    ]);

    // Active users: users who posted or commented in last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await this.userRepo
      .createQueryBuilder('u')
      .where(
        'u.id IN (SELECT user_id FROM posts WHERE created_at >= :since) OR u.id IN (SELECT user_id FROM comments WHERE created_at >= :since)',
        { since: sevenDaysAgo },
      )
      .getCount();

    // Trends for last 7 days
    const userTrend = await this.getTrend('users', sevenDaysAgo);
    const postTrend = await this.getTrend('posts', sevenDaysAgo);

    // Post type distribution
    const typeRaw = await this.postRepo
      .createQueryBuilder('p')
      .select('p.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('p.status = 0')
      .groupBy('p.type')
      .getRawMany();
    const postTypeDistribution = typeRaw.map((r) => ({
      type: r.type === 1 ? '纯文字' : '图文',
      count: Number(r.count),
    }));

    // Review stats
    const [pending, approved, rejected] = await Promise.all([
      this.postRepo.count({ where: { reviewStatus: 0 } }),
      this.postRepo.count({ where: { reviewStatus: 1 } }),
      this.postRepo.count({ where: { reviewStatus: 2 } }),
    ]);

    return {
      todayUsers,
      todayPosts,
      todayComments,
      activeUsers,
      userTrend,
      postTrend,
      postTypeDistribution,
      reviewStats: { pending, approved, rejected },
    };
  }

  private async getTrend(table: string, since: Date) {
    const raw = await this.adminRepo.query(
      `SELECT DATE_FORMAT(created_at, '%m-%d') AS date, COUNT(*) AS count FROM ${table} WHERE created_at >= ? GROUP BY date ORDER BY date`,
      [since],
    );
    return raw.map((r: any) => ({ date: r.date, count: Number(r.count) }));
  }

  // ==================== Users ====================

  async getUsers(page: number, pageSize: number, keyword?: string) {
    const where: any = {};
    if (keyword) {
      where.nickname = LikeOp(`%${keyword}%`);
    }
    const [list, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  async toggleUserStatus(userId: number, status: number) {
    await this.userRepo.update(userId, { status });
    return { success: true };
  }

  // ==================== Posts ====================

  async getPosts(page: number, pageSize: number, keyword?: string, status?: number) {
    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .leftJoinAndSelect('p.images', 'images')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (keyword) {
      qb.andWhere('(p.title LIKE :kw OR p.content LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status !== undefined && status !== null) {
      qb.andWhere('p.reviewStatus = :status', { status });
    }

    const [list, total] = await qb.getManyAndCount();
    return {
      list: list.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content.slice(0, 100),
        type: p.type,
        authorName: p.author?.nickname || '',
        reviewStatus: p.reviewStatus,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
        coverUrl: p.images?.[0]?.imageUrl || '',
        createdAt: p.createdAt,
      })),
      total,
    };
  }

  async deletePost(postId: number) {
    await this.postRepo.update(postId, { status: 1 });
    return { success: true };
  }

  // ==================== Comments ====================

  async getComments(page: number, pageSize: number, keyword?: string) {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'user')
      .where('c.status = 0')
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (keyword) {
      qb.andWhere('c.content LIKE :kw', { kw: `%${keyword}%` });
    }

    const [list, total] = await qb.getManyAndCount();
    return {
      list: list.map((c) => ({
        id: c.id,
        postId: c.postId,
        content: c.content,
        userName: c.user?.nickname || '',
        createdAt: c.createdAt,
      })),
      total,
    };
  }

  async deleteComment(commentId: number) {
    await this.commentRepo.update(commentId, { status: 1 });
    return { success: true };
  }

  // ==================== Tags ====================

  async getTags() {
    return this.tagRepo.find({ order: { postCount: 'DESC' } });
  }

  async createTag(name: string, schoolId?: number) {
    const existing = await this.tagRepo.findOne({ where: { name } });
    if (existing) throw new BadRequestException('标签已存在');
    const tag = this.tagRepo.create({ name, schoolId: schoolId || undefined });
    return this.tagRepo.save(tag);
  }

  async updateTag(id: number, name: string) {
    await this.tagRepo.update(id, { name });
    return { success: true };
  }

  async deleteTag(id: number) {
    await this.tagRepo.delete(id);
    return { success: true };
  }

  // ==================== Review ====================

  async getReviewQueue(page: number, pageSize: number) {
    const [list, total] = await this.postRepo.findAndCount({
      where: { reviewStatus: 0 },
      relations: ['author', 'images'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      list: list.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        type: p.type,
        authorName: p.author?.nickname || '',
        coverUrl: p.images?.[0]?.imageUrl || '',
        createdAt: p.createdAt,
      })),
      total,
    };
  }

  async reviewPost(postId: number, status: number, reason?: string) {
    const update: any = { reviewStatus: status };
    if (reason) update.reviewReason = reason;
    await this.postRepo.update(postId, update);
    return { success: true };
  }

  // ==================== Schools ====================

  async getSchools() {
    return this.schoolRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createSchool(data: Partial<School>) {
    const school = this.schoolRepo.create(data);
    return this.schoolRepo.save(school);
  }

  async updateSchool(id: number, data: Partial<School>) {
    await this.schoolRepo.update(id, data);
    return { success: true };
  }

  // ==================== Admins ====================

  async getAdmins() {
    const admins = await this.adminRepo.find({ order: { createdAt: 'DESC' } });
    return admins.map((a) => ({
      id: a.id,
      username: a.username,
      nickname: a.nickname,
      role: a.role,
      createdAt: a.createdAt,
    }));
  }

  async createAdmin(username: string, password: string, role: string, nickname?: string) {
    const existing = await this.adminRepo.findOne({ where: { username } });
    if (existing) throw new BadRequestException('用户名已存在');
    const hashed = await bcrypt.hash(password, 10);
    const admin = this.adminRepo.create({
      username,
      password: hashed,
      role: role || 'operator',
      nickname: nickname || username,
    });
    return this.adminRepo.save(admin);
  }

  async deleteAdmin(id: number) {
    await this.adminRepo.delete(id);
    return { success: true };
  }

  // ==================== Notifications ====================

  async sendNotification(scope: string, content: string, schoolId?: number) {
    if (scope === 'all') {
      const users = await this.userRepo.find({ select: ['id'] });
      const notifications = users.map((u) =>
        this.notificationRepo.create({
          userId: u.id,
          type: 'system',
          content,
        }),
      );
      await this.notificationRepo.save(notifications);
    } else if (scope === 'school' && schoolId) {
      const users = await this.userRepo
        .createQueryBuilder('u')
        .innerJoin('user_schools', 'us', 'us.user_id = u.id')
        .where('us.school_id = :schoolId', { schoolId })
        .select('u.id', 'id')
        .getRawMany();
      const notifications = users.map((u: any) =>
        this.notificationRepo.create({
          userId: u.id,
          type: 'system',
          content,
        }),
      );
      if (notifications.length > 0) {
        await this.notificationRepo.save(notifications);
      }
    }
    return { success: true };
  }

  // ==================== Logs ====================

  async getLogs(page: number, pageSize: number) {
    const [list, total] = await this.logRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total };
  }

  async addLog(adminName: string, action: string, target: string, ip: string) {
    const log = this.logRepo.create({ adminName, action, target, ip });
    return this.logRepo.save(log);
  }

  // ==================== Seed ====================

  async ensureDefaultAdmin() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.adminRepo.save(
        this.adminRepo.create({
          username: 'admin',
          password: hashed,
          nickname: '超级管理员',
          role: 'super_admin',
        }),
      );
      console.log('Default admin created: admin / admin123');
    }
  }
}
