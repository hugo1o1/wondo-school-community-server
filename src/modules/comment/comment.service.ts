import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(userId: number, postId: number, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId, status: 0 } });
    if (!post) throw new NotFoundException('帖子不存在');

    if (dto.parentId) {
      const parent = await this.commentRepo.findOne({ where: { id: dto.parentId, postId, status: 0 } });
      if (!parent) throw new NotFoundException('父评论不存在');
    }

    const comment = this.commentRepo.create({
      userId,
      postId,
      content: dto.content,
      parentId: dto.parentId || null,
    });

    const saved = await this.commentRepo.save(comment);

    // 更新帖子评论数
    await this.postRepo.increment({ id: postId }, 'commentCount', 1);

    return saved;
  }

  async findByPostId(postId: number, page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.commentRepo.findAndCount({
      where: { postId, status: 0 },
      relations: ['user'],
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

  async remove(userId: number, id: number) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.userId !== userId) throw new ForbiddenException('无权删除');

    await this.commentRepo.update(id, { status: 1 });

    // 更新帖子评论数
    await this.postRepo.decrement({ id: comment.postId }, 'commentCount', 1);

    return { success: true };
  }
}
