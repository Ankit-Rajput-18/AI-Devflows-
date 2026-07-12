import { IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CodeReviewDto {
  @ApiProperty({ example: 'function add(a, b) { return a + b; }' })
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  code: string;

  @ApiProperty({ example: 'typescript' })
  @IsString()
  language: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taskId?: string;
}

export class BugDetectionDto {
  @ApiProperty({ example: 'const x = null; x.toString();' })
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  code: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  language: string;
}

export class PRSummaryDto {
  @ApiProperty({ example: 'diff --git a/file.ts ...' })
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  code: string;
}

export class DocGeneratorDto {
  @ApiProperty({ example: 'export class UserService { ... }' })
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  code: string;

  @ApiProperty({ example: 'typescript' })
  @IsString()
  language: string;
}
