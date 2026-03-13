import { Controller, Get, Post as HttpPost, Delete, Param, Body, Query, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@ApiTags('帖子')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('list')
  @ApiOperation({ summary: '获取帖子列表' })
  async getList(@Query() query: QueryPostDto, @Headers('x-school-id') schoolId: string) {
    return this.postService.findAll(+schoolId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取帖子详情' })
  async getDetail(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @HttpPost('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建帖子' })
  async create(@Request() req: { user: { userId: number } }, @Body() dto: CreatePostDto, @Headers('x-school-id') schoolId: string) {
    return this.postService.create(req.user.userId, +schoolId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子' })
  async remove(@Request() req: { user: { userId: number } }, @Param('id') id: string) {
    return this.postService.remove(req.user.userId, +id);
  }

  @HttpPost(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞/取消点赞' })
  async toggleLike(@Request() req: { user: { userId: number } }, @Param('id') id: string) {
    return this.postService.toggleLike(req.user.userId, +id);
  }

  @HttpPost(':id/collect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏/取消收藏' })
  async toggleCollect(@Request() req: { user: { userId: number } }, @Param('id') id: string) {
    return this.postService.toggleCollect(req.user.userId, +id);
  }
}
