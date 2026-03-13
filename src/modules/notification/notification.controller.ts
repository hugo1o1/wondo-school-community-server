import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('通知')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取通知列表' })
  async getList(
    @Request() req: { user: { userId: number } },
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    return this.notificationService.findByUserId(req.user.userId, +page, +pageSize);
  }

  @Put('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记全部已读' })
  async readAll(@Request() req: { user: { userId: number } }) {
    return this.notificationService.readAll(req.user.userId);
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记单条已读' })
  async markRead(@Request() req: { user: { userId: number } }, @Param('id') id: string) {
    return this.notificationService.markRead(req.user.userId, +id);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取未读数量' })
  async getUnreadCount(@Request() req: { user: { userId: number } }) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }
}
