import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createBudgetDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate date range
    const startDate = new Date(createBudgetDto.startDate);
    const endDate = new Date(createBudgetDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping budgets for the same category and period
    const overlappingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId: createBudgetDto.categoryId,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingBudget) {
      throw new ConflictException('A budget already exists for this category in the specified period');
    }

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        categoryId: createBudgetDto.categoryId,
        amount: createBudgetDto.amount,
        period: createBudgetDto.period,
        startDate,
        endDate,
      },
      include: {
        category: true,
      },
    });

    return {
      data: budget,
      message: 'Budget created successfully',
    };
  }

  async findAll(userId: string, query?: QueryBudgetDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.BudgetWhereInput = {
      userId,
    };

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.period) {
      where.period = query.period;
    }

    if (query?.active) {
      const now = new Date();
      where.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } },
      ];
    }

    // Build orderBy
    const sort = query?.sort || '-createdAt';
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    const orderBy: Prisma.BudgetOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    // Execute queries
    const [budgets, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.budget.count({ where }),
    ]);

    // Calculate progress for each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(userId, budget.id, budget.categoryId, budget.startDate, budget.endDate);
        return {
          ...budget,
          spent,
          remaining: Number(budget.amount) - spent,
          percentage: (spent / Number(budget.amount)) * 100,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: budgetsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      message: 'Budgets retrieved successfully',
    };
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Calculate budget progress
    const spent = await this.calculateSpent(userId, budget.id, budget.categoryId, budget.startDate, budget.endDate);

    return {
      data: {
        ...budget,
        spent,
        remaining: Number(budget.amount) - spent,
        percentage: (spent / Number(budget.amount)) * 100,
      },
      message: 'Budget retrieved successfully',
    };
  }

  async update(userId: string, id: string, updateBudgetDto: UpdateBudgetDto) {
    // Check if budget exists and belongs to user
    const existingBudget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    // If categoryId is being updated, verify it exists
    if (updateBudgetDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateBudgetDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Validate date range if dates are being updated
    const startDate = updateBudgetDto.startDate
      ? new Date(updateBudgetDto.startDate)
      : existingBudget.startDate;
    const endDate = updateBudgetDto.endDate
      ? new Date(updateBudgetDto.endDate)
      : existingBudget.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping budgets (excluding current budget)
    const categoryId = updateBudgetDto.categoryId || existingBudget.categoryId;
    const overlappingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        id: { not: id },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingBudget) {
      throw new ConflictException('A budget already exists for this category in the specified period');
    }

    const updateData: Prisma.BudgetUpdateInput = {};
    if (updateBudgetDto.amount !== undefined) updateData.amount = updateBudgetDto.amount;
    if (updateBudgetDto.period) updateData.period = updateBudgetDto.period;
    if (updateBudgetDto.categoryId) updateData.category = { connect: { id: updateBudgetDto.categoryId } };
    if (updateBudgetDto.startDate) updateData.startDate = new Date(updateBudgetDto.startDate);
    if (updateBudgetDto.endDate) updateData.endDate = new Date(updateBudgetDto.endDate);

    const budget = await this.prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return {
      data: budget,
      message: 'Budget updated successfully',
    };
  }

  async remove(userId: string, id: string) {
    // Check if budget exists and belongs to user
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return {
      message: 'Budget deleted successfully',
    };
  }

  private async calculateSpent(
    userId: string,
    budgetId: string,
    categoryId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }
}
