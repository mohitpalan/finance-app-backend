import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';

@ApiTags('budgets')
@ApiBearerAuth('JWT-auth')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Budget already exists for this category in the specified period' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for current user with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['MONTHLY', 'YEARLY'] })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryBudgetDto,
  ) {
    return this.budgetsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID with progress' })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.budgetsService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  @ApiResponse({ status: 409, description: 'Budget already exists for this category in the specified period' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(userId, id, updateBudgetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.budgetsService.remove(userId, id);
  }
}
