import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CampusService } from './campus.service';

@ApiTags('校园应用')
@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Get('grade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查成绩' })
  async getGrades(@Request() req: { user: { userId: number } }) {
    return this.campusService.getGrades(req.user.userId);
  }

  @Get('schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查课表' })
  async getSchedule(@Request() req: { user: { userId: number } }) {
    return this.campusService.getSchedule(req.user.userId);
  }
}
