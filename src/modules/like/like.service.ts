import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Collection } from './entities/collection.entity';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async toggleLike(userId: number, postId: number): Promise<{ liked: boolean }> {
    const existing = await this.likeRepo.findOne({ where: { userId, postId } });

    if (existing) {
      await this.likeRepo.remove(existing);
      await this.postRepo.decrement({ id: postId }, 'likeCount', 1);
      return { liked: false };
    } else {
      const like = this.likeRepo.create({ userId, postId });
      await this.likeRepo.save(like);
      await this.postRepo.increment({ id: postId }, 'likeCount', 1);
      return { liked: true };
    }
  }

  async toggleCollect(userId: number, postId: number): Promise<{ collected: boolean }> {
    const existing = await this.collectionRepo.findOne({ where: { userId, postId } });

    if (existing) {
      await this.collectionRepo.remove(existing);
      await this.postRepo.decrement({ id: postId }, 'collectCount', 1);
      return { collected: false };
    } else {
      const collection = this.collectionRepo.create({ userId, postId });
      await this.collectionRepo.save(collection);
      await this.postRepo.increment({ id: postId }, 'collectCount', 1);
      return { collected: true };
    }
  }

  async isLiked(userId: number, postId: number): Promise<boolean> {
    const count = await this.likeRepo.count({ where: { userId, postId } });
    return count > 0;
  }

  async isCollected(userId: number, postId: number): Promise<boolean> {
    const count = await this.collectionRepo.count({ where: { userId, postId } });
    return count > 0;
  }
}
