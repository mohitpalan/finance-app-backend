import { IsNumber, IsPositive, IsEnum, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../common/enums';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction amount',
    example: 150.50,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Transaction description',
    example: 'Weekly grocery shopping',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Transaction date (ISO 8601 format)',
    example: '2025-11-17',
  })
  @IsDateString()
  date: string;
}
