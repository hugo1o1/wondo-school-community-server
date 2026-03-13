import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(data: { userId: number; type: string; content: string; relatedPostId?: number }) {
    const notification = this.notificationRepo.create({
      userId: data.userId,
      type: data.type,
      content: data.content,
      relatedPostId: data.relatedPostId || null,
    });
    return this.notificationRepo.save(notification);
  }

  async findByUserId(userId: number, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async markRead(userId: number, id: number) {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  async readAll(userId: number) {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationRepo.count({ where: { userId, isRead: false } });
    return { count };
  }
}
