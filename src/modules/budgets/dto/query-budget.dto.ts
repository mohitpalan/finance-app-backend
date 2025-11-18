import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod } from '../../../common/enums';
import { Type } from 'class-transformer';

export class QueryBudgetDto {
  @ApiPropertyOptional({
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by budget period',
    enum: BudgetPeriod,
  })
  @IsOptional()
  @IsEnum(BudgetPeriod)
  period?: BudgetPeriod;

  @ApiPropertyOptional({
    description: 'Filter by active budgets (within current period)',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field (prefix with - for descending)',
    example: '-createdAt',
    default: '-createdAt',
  })
  @IsOptional()
  @IsString()
  sort?: string = '-createdAt';
}
