import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SchoolAuthDto {
  @ApiProperty({ description: '学校ID' })
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;

  @ApiProperty({ description: '学号' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  studentId: string;

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  realName: string;
}

export class SwitchSchoolDto {
  @ApiProperty({ description: '学校ID' })
  @IsNumber()
  @IsNotEmpty()
  schoolId: number;
}
