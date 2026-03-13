import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { PostTag } from './entities/post-tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { LikeService } from '../like/like.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepo: Repository<PostImage>,
    @InjectRepository(PostTag)
    private readonly postTagRepo: Repository<PostTag>,
    private readonly likeService: LikeService,
    private readonly reviewService: ReviewService,
  ) {}

  async findAll(schoolId: number, query: QueryPostDto) {
    const { page = 1, pageSize = 20 } = query;
    const [list, total] = await this.postRepo.findAndCount({
      where: { schoolId, reviewStatus: 1, status: 0 },
      relations: ['author', 'images', 'postTags', 'postTags.tag'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 把 postTags 转换为前端期望的 tags 格式
    const formattedList = list.map((post) => {
      const { postTags, ...rest } = post;
      return {
        ...rest,
        tags: postTags?.map((pt) => pt.tag) || [],
      };
    });

    return {
      list: formattedList,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id, status: 0 },
      relations: ['author', 'images', 'postTags', 'postTags.tag'],
    });
    if (!post) throw new NotFoundException('帖子不存在');

    // Increment view count
    await this.postRepo.increment({ id }, 'viewCount', 1);
    post.viewCount += 1;

    // 转换 tags 格式
    const { postTags, ...rest } = post;
    return {
      ...rest,
      tags: postTags?.map((pt) => pt.tag) || [],
    };
  }

  async create(userId: number, schoolId: number, dto: CreatePostDto) {
    const post = this.postRepo.create({
      userId,
      schoolId,
      type: dto.type,
      template: dto.template,
      title: dto.title,
      content: dto.content,
      reviewStatus: 0, // pending review
    });

    const saved = await this.postRepo.save(post);

    // Save images
    if (dto.imageUrls?.length) {
      const images = dto.imageUrls.map((url, index) =>
        this.postImageRepo.create({
          postId: saved.id,
          imageUrl: url,
          sortOrder: index,
        }),
      );
      await this.postImageRepo.save(images);
    }

    // Save tags
    if (dto.tagIds?.length) {
      const postTags = dto.tagIds.map((tagId) =>
        this.postTagRepo.create({
          postId: saved.id,
          tagId,
        }),
      );
      await this.postTagRepo.save(postTags);
    }

    // 触发内容审核
    await this.reviewService.reviewPost(saved.id);

    return saved;
  }

  async remove(userId: number, id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('帖子不存在');
    if (post.userId !== userId) throw new ForbiddenException('无权删除');

    await this.postRepo.update(id, { status: 1 });
    return { success: true };
  }

  async toggleLike(userId: number, postId: number) {
    return this.likeService.toggleLike(userId, postId);
  }

  async toggleCollect(userId: number, postId: number) {
    return this.likeService.toggleCollect(userId, postId);
  }
}
