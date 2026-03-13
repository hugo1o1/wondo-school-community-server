import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AdminLog } from './entities/admin-log.entity';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Tag } from '../tag/entities/tag.entity';
import { School } from '../school/entities/school.entity';
import { Notification } from '../notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, AdminLog, User, Post, Comment, Tag, School, Notification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtGuard],
  exports: [AdminService],
})
export class AdminModule implements OnModuleInit {
  constructor(private readonly adminService: AdminService) {}

  async onModuleInit() {
    await this.adminService.ensureDefaultAdmin();
  }
}
