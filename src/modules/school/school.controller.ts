import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SchoolService } from './school.service';
import { SchoolAuthDto, SwitchSchoolDto } from './dto/school-auth.dto';

@ApiTags('学校')
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get('list')
  @ApiOperation({ summary: '获取学校列表' })
  async getList() {
    return this.schoolService.findAll();
  }

  @Post('auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '学校认证' })
  async auth(@Request() req: { user: { userId: number } }, @Body() dto: SchoolAuthDto) {
    return this.schoolService.auth(req.user.userId, dto);
  }

  @Post('switch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换当前学校' })
  async switchSchool(@Request() req: { user: { userId: number } }, @Body() dto: SwitchSchoolDto) {
    return this.schoolService.switchSchool(req.user.userId, dto.schoolId);
  }
}
