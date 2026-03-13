import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School } from './entities/school.entity';
import { UserSchool } from './entities/user-school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School, UserSchool])],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService, TypeOrmModule],
})
export class SchoolModule {}
