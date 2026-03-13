import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagService } from './tag.service';

@ApiTags('标签')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('list')
  @ApiOperation({ summary: '获取标签列表' })
  async getList(@Query('schoolId') schoolId?: string) {
    return this.tagService.findAll(schoolId ? +schoolId : undefined);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门标签' })
  async getHot() {
    return this.tagService.findHot();
  }
}
