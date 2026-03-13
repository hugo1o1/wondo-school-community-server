import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Like } from '../like/entities/like.entity';
import { Collection } from '../like/entities/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Like, Collection])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
