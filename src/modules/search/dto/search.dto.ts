import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ description: '标签ID筛选' })
  @IsOptional()
  @IsNumber()
  tagId?: number;

  @ApiPropertyOptional({ description: '学校ID' })
  @IsOptional()
  @IsNumber()
  schoolId?: number;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number = 20;
}
