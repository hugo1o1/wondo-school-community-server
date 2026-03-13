import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class ReviewService {
  // 敏感词列表（后续可从数据库/配置文件加载）
  private readonly sensitiveWords: string[] = [
    '赌博', '色情', '毒品', '暴力', '枪支',
    '诈骗', '传销', '反动', '邪教', '恐怖',
    '代写', '代考', '作弊', '枪手',
  ];

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async reviewPost(postId: number): Promise<{ passed: boolean; reason?: string }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      return { passed: false, reason: '帖子不存在' };
    }

    const textToReview = `${post.title} ${post.content}`;
    const foundWords = this.sensitiveWords.filter((word) => textToReview.includes(word));

    if (foundWords.length > 0) {
      const reason = `包含敏感词: ${foundWords.join(', ')}`;
      await this.postRepo.update(postId, {
        reviewStatus: 2,
        reviewReason: reason,
      });
      return { passed: false, reason };
    }

    // 审核通过
    await this.postRepo.update(postId, { reviewStatus: 1 });
    return { passed: true };
  }
}
