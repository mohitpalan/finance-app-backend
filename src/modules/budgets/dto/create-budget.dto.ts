import { IsNumber, IsPositive, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetPeriod } from '../../../common/enums';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Category ID for the budget',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Budget amount',
    example: 500.00,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Budget period',
    enum: BudgetPeriod,
    example: BudgetPeriod.MONTHLY,
  })
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @ApiProperty({
    description: 'Budget start date (ISO 8601 format)',
    example: '2025-11-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Budget end date (ISO 8601 format)',
    example: '2025-11-30',
  })
  @IsDateString()
  endDate: string;
}
