import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
interface AdminRequest {
  admin: { id: number; username: string; role: string };
  ip?: string;
  headers: Record<string, any>;
}

@ApiTags('管理后台')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== Auth ====================

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() body: { username: string; password: string }, @Req() req: any) {
    const result = await this.adminService.login(body.username, body.password);
    await this.adminService.addLog(body.username, '登录', '', req.ip || '');
    return result;
  }

  @Get('profile')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员信息' })
  async getProfile(@Req() req: AdminRequest) {
    return this.adminService.getProfile(req.admin.id);
  }

  // ==================== Dashboard ====================

  @Get('dashboard')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '仪表盘数据' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // ==================== Users ====================

  @Get('users')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户列表' })
  async getUsers(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('keyword') keyword?: string,
  ) {
    return this.adminService.getUsers(+page, +pageSize, keyword);
  }

  @Put('users/:id/status')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换用户状态' })
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { status: number },
    @Req() req: AdminRequest,
  ) {
    const result = await this.adminService.toggleUserStatus(+id, body.status);
    await this.adminService.addLog(req.admin.username, body.status === 1 ? '禁用用户' : '启用用户', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Posts ====================

  @Get('posts')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '帖子列表' })
  async getPosts(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPosts(+page, +pageSize, keyword, status !== undefined && status !== '' ? +status : undefined);
  }

  @Delete('posts/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子' })
  async deletePost(@Param('id') id: string, @Req() req: AdminRequest) {
    const result = await this.adminService.deletePost(+id);
    await this.adminService.addLog(req.admin.username, '删除帖子', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Comments ====================

  @Get('comments')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '评论列表' })
  async getComments(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('keyword') keyword?: string,
  ) {
    return this.adminService.getComments(+page, +pageSize, keyword);
  }

  @Delete('comments/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  async deleteComment(@Param('id') id: string, @Req() req: AdminRequest) {
    const result = await this.adminService.deleteComment(+id);
    await this.adminService.addLog(req.admin.username, '删除评论', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Tags ====================

  @Get('tags')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '标签列表' })
  async getTags() {
    return this.adminService.getTags();
  }

  @Post('tags')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签' })
  async createTag(@Body() body: { name: string; schoolId?: number }, @Req() req: AdminRequest) {
    const result = await this.adminService.createTag(body.name, body.schoolId);
    await this.adminService.addLog(req.admin.username, '新增标签', body.name, req.ip || '');
    return result;
  }

  @Put('tags/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新标签' })
  async updateTag(@Param('id') id: string, @Body() body: { name: string }, @Req() req: AdminRequest) {
    const result = await this.adminService.updateTag(+id, body.name);
    await this.adminService.addLog(req.admin.username, '编辑标签', `#${id}`, req.ip || '');
    return result;
  }

  @Delete('tags/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签' })
  async deleteTag(@Param('id') id: string, @Req() req: AdminRequest) {
    const result = await this.adminService.deleteTag(+id);
    await this.adminService.addLog(req.admin.username, '删除标签', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Review ====================

  @Get('review')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核队列' })
  async getReviewQueue(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.adminService.getReviewQueue(+page, +pageSize);
  }

  @Put('review/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核帖子' })
  async reviewPost(
    @Param('id') id: string,
    @Body() body: { status: number; reason?: string },
    @Req() req: AdminRequest,
  ) {
    const result = await this.adminService.reviewPost(+id, body.status, body.reason);
    const action = body.status === 1 ? '审核通过帖子' : '审核拒绝帖子';
    await this.adminService.addLog(req.admin.username, action, `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Schools ====================

  @Get('schools')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '学校列表' })
  async getSchools() {
    return this.adminService.getSchools();
  }

  @Post('schools')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建学校' })
  async createSchool(@Body() body: { name: string; code: string; logoUrl?: string; primaryColor?: string }, @Req() req: AdminRequest) {
    const result = await this.adminService.createSchool(body);
    await this.adminService.addLog(req.admin.username, '新增学校', body.name, req.ip || '');
    return result;
  }

  @Put('schools/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新学校' })
  async updateSchool(@Param('id') id: string, @Body() body: Partial<{ name: string; code: string; logoUrl: string; primaryColor: string; status: number }>, @Req() req: AdminRequest) {
    const result = await this.adminService.updateSchool(+id, body);
    await this.adminService.addLog(req.admin.username, '编辑学校', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Admins ====================

  @Get('admins')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员列表' })
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  @Post('admins')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建管理员' })
  async createAdmin(@Body() body: { username: string; password: string; role: string; nickname?: string }, @Req() req: AdminRequest) {
    const result = await this.adminService.createAdmin(body.username, body.password, body.role, body.nickname);
    await this.adminService.addLog(req.admin.username, '新增管理员', body.username, req.ip || '');
    return result;
  }

  @Delete('admins/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除管理员' })
  async deleteAdmin(@Param('id') id: string, @Req() req: AdminRequest) {
    const result = await this.adminService.deleteAdmin(+id);
    await this.adminService.addLog(req.admin.username, '删除管理员', `#${id}`, req.ip || '');
    return result;
  }

  // ==================== Notifications ====================

  @Post('notifications')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发送系统通知' })
  async sendNotification(@Body() body: { scope: string; content: string; schoolId?: number }, @Req() req: AdminRequest) {
    const result = await this.adminService.sendNotification(body.scope, body.content, body.schoolId);
    await this.adminService.addLog(req.admin.username, '发送通知', body.scope === 'all' ? '全站' : `学校#${body.schoolId}`, req.ip || '');
    return result;
  }

  // ==================== Logs ====================

  @Get('logs')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '操作日志' })
  async getLogs(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.adminService.getLogs(+page, +pageSize);
  }
}
