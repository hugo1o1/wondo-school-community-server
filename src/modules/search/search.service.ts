import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post/entities/post.entity';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async search(dto: SearchDto) {
    const { keyword, tagId, schoolId, page = 1, pageSize = 20 } = dto;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.status = :status', { status: 0 })
      .andWhere('post.reviewStatus = :reviewStatus', { reviewStatus: 1 });

    if (keyword) {
      qb.andWhere('(post.title LIKE :keyword OR post.content LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    if (schoolId) {
      qb.andWhere('post.schoolId = :schoolId', { schoolId });
    }

    if (tagId) {
      qb.andWhere('postTags.tagId = :tagId', { tagId });
    }

    // 按相关度（标题匹配优先）+ 时间排序
    if (keyword) {
      qb.addSelect(
        `CASE WHEN post.title LIKE :keyword THEN 1 ELSE 0 END`,
        'title_match',
      );
      qb.orderBy('title_match', 'DESC');
      qb.addOrderBy('post.createdAt', 'DESC');
    } else {
      qb.orderBy('post.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 转换 tags 格式
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
}
