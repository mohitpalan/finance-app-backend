import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createTransactionDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify transaction type matches category type
    if (category.type !== createTransactionDto.type) {
      throw new ForbiddenException(
        `Category type (${category.type}) does not match transaction type (${createTransactionDto.type})`,
      );
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        categoryId: createTransactionDto.categoryId,
        description: createTransactionDto.description,
        date: new Date(createTransactionDto.date),
      },
      include: {
        category: true,
      },
    });

    return {
      data: transaction,
      message: 'Transaction created successfully',
    };
  }

  async findAll(userId: string, query?: QueryTransactionDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    if (query?.minAmount !== undefined || query?.maxAmount !== undefined) {
      where.amount = {};
      if (query.minAmount !== undefined) {
        where.amount.gte = query.minAmount;
      }
      if (query.maxAmount !== undefined) {
        where.amount.lte = query.maxAmount;
      }
    }

    if (query?.search) {
      where.description = {
        contains: query.search,
      };
    }

    // Build orderBy
    const sort = query?.sort || '-createdAt';
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    // Execute queries
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      message: 'Transactions retrieved successfully',
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      data: transaction,
      message: 'Transaction retrieved successfully',
    };
  }

  async update(userId: string, id: string, updateTransactionDto: UpdateTransactionDto) {
    // Check if transaction exists and belongs to user
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    // If categoryId is being updated, verify it exists and type matches
    if (updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateTransactionDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Check if type is being updated or use existing type
      const transactionType = updateTransactionDto.type || existingTransaction.type;
      if (category.type !== transactionType) {
        throw new ForbiddenException(
          `Category type (${category.type}) does not match transaction type (${transactionType})`,
        );
      }
    }

    // If only type is being updated, verify it matches the category type
    if (updateTransactionDto.type && !updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: existingTransaction.categoryId },
      });

      if (category && category.type !== updateTransactionDto.type) {
        throw new ForbiddenException(
          `Transaction type (${updateTransactionDto.type}) does not match category type (${category.type})`,
        );
      }
    }

    const updateData: Prisma.TransactionUpdateInput = {};
    if (updateTransactionDto.amount !== undefined) updateData.amount = updateTransactionDto.amount;
    if (updateTransactionDto.type) updateData.type = updateTransactionDto.type;
    if (updateTransactionDto.categoryId) updateData.category = { connect: { id: updateTransactionDto.categoryId } };
    if (updateTransactionDto.description !== undefined) updateData.description = updateTransactionDto.description;
    if (updateTransactionDto.date) updateData.date = new Date(updateTransactionDto.date);

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return {
      data: transaction,
      message: 'Transaction updated successfully',
    };
  }

  async remove(userId: string, id: string) {
    // Check if transaction exists and belongs to user
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id },
    });

    return {
      message: 'Transaction deleted successfully',
    };
  }

  async getStatistics(userId: string, startDate?: string, endDate?: string) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [totalIncome, totalExpense, transactionCount, transactions] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        select: {
          categoryId: true,
          amount: true,
          type: true,
        },
      }),
    ]);

    // Calculate category breakdown
    const categoryBreakdown: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (!categoryBreakdown[t.categoryId]) {
        categoryBreakdown[t.categoryId] = { income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        categoryBreakdown[t.categoryId].income += Number(t.amount);
      } else {
        categoryBreakdown[t.categoryId].expense += Number(t.amount);
      }
    });

    const income = totalIncome._sum.amount ? Number(totalIncome._sum.amount) : 0;
    const expense = totalExpense._sum.amount ? Number(totalExpense._sum.amount) : 0;

    return {
      data: {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        transactionCount,
        categoryBreakdown,
      },
      message: 'Transaction statistics retrieved successfully',
    };
  }
}
