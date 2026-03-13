import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { Collection } from './entities/collection.entity';
import { Post } from '../post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Collection, Post])],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
