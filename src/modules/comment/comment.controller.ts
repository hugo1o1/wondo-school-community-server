import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('评论')
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('post/:id/comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评论' })
  async create(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(req.user.userId, +id, dto);
  }

  @Get('post/:id/comment')
  @ApiOperation({ summary: '获取帖子评论列表' })
  async getList(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    return this.commentService.findByPostId(+id, +page, +pageSize);
  }

  @Delete('comment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  async remove(@Request() req: { user: { userId: number } }, @Param('id') id: string) {
    return this.commentService.remove(req.user.userId, +id);
  }
}
