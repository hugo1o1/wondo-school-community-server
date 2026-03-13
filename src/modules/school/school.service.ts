import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { UserSchool } from './entities/user-school.entity';
import { SchoolAuthDto } from './dto/school-auth.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(UserSchool)
    private readonly userSchoolRepo: Repository<UserSchool>,
  ) {}

  async findAll() {
    return this.schoolRepo.find({
      where: { status: 0 },
      order: { createdAt: 'DESC' },
    });
  }

  async auth(userId: number, dto: SchoolAuthDto) {
    const school = await this.schoolRepo.findOne({ where: { id: dto.schoolId, status: 0 } });
    if (!school) throw new NotFoundException('学校不存在');

    // 检查是否已认证
    const existing = await this.userSchoolRepo.findOne({
      where: { userId, schoolId: dto.schoolId },
    });
    if (existing) throw new BadRequestException('已提交过该学校认证');

    const userSchool = this.userSchoolRepo.create({
      userId,
      schoolId: dto.schoolId,
      studentId: dto.studentId,
      realName: dto.realName,
      authStatus: 1, // 暂时自动通过
      isCurrent: true,
    });

    // 将其他学校设为非当前
    await this.userSchoolRepo.update({ userId }, { isCurrent: false });

    return this.userSchoolRepo.save(userSchool);
  }

  async switchSchool(userId: number, schoolId: number) {
    const userSchool = await this.userSchoolRepo.findOne({
      where: { userId, schoolId, authStatus: 1 },
    });
    if (!userSchool) throw new NotFoundException('未认证该学校或认证未通过');

    // 将所有学校设为非当前
    await this.userSchoolRepo.update({ userId }, { isCurrent: false });

    // 设置目标学校为当前
    await this.userSchoolRepo.update({ id: userSchool.id }, { isCurrent: true });

    return { success: true, schoolId };
  }
}
