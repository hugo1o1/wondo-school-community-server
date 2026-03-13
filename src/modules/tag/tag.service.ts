import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(schoolId?: number) {
    if (schoolId) {
      // 返回该学校专属标签 + 通用标签
      return this.tagRepo.find({
        where: [
          { schoolId },
          { schoolId: IsNull() as unknown as number },
        ],
        order: { postCount: 'DESC' },
      });
    }
    return this.tagRepo.find({ order: { postCount: 'DESC' } });
  }

  async findHot() {
    return this.tagRepo.find({
      order: { postCount: 'DESC' },
      take: 20,
    });
  }
}
