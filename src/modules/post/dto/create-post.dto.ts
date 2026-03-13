import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, MaxLength, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '帖子类型 1=纯文字 2=图文' })
  @IsNumber()
  @IsIn([1, 2])
  type: number;

  @ApiPropertyOptional({ description: '文字模板 A/B/C' })
  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C'])
  template?: string;

  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({ description: '图片URL列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ description: '标签ID列表' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}
