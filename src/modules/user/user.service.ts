import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Like } from '../like/entities/like.entity';
import { Collection } from '../like/entities/collection.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async findByOpenid(openid: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { openid } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async getStats(userId: number) {
    const postCount = await this.postRepo.count({ where: { userId, status: 0 } });
    const likeCount = await this.likeRepo
      .createQueryBuilder('l')
      .innerJoin('posts', 'p', 'p.id = l.post_id')
      .where('p.user_id = :userId', { userId })
      .getCount();
    const collectCount = await this.collectionRepo.count({ where: { userId } });
    return { postCount, likeCount, collectCount };
  }
}
