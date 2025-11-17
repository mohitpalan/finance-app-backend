import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../../common/enums';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category with same name and type already exists
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        type: createCategoryDto.type,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name '${createCategoryDto.name}' and type '${createCategoryDto.type}' already exists`,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        type: createCategoryDto.type,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
        isDefault: false,
      },
    });

    return {
      data: category,
      message: 'Category created successfully',
    };
  }

  async findAll(type?: TransactionType) {
    const where = type ? { type } : {};

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    return {
      data: categories,
      message: 'Categories retrieved successfully',
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: category,
      message: 'Category retrieved successfully',
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // If name or type is being updated, check for duplicates
    if (updateCategoryDto.name || updateCategoryDto.type) {
      const name = updateCategoryDto.name || existingCategory.name;
      const type = updateCategoryDto.type || existingCategory.type;

      const duplicateCategory = await this.prisma.category.findFirst({
        where: {
          name,
          type,
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        throw new ConflictException(
          `Category with name '${name}' and type '${type}' already exists`,
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return {
      data: category,
      message: 'Category updated successfully',
    };
  }

  async remove(id: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Prevent deletion of categories with associated transactions or budgets
    if (category._count.transactions > 0 || category._count.budgets > 0) {
      throw new ConflictException(
        'Cannot delete category with existing transactions or budgets',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Category deleted successfully',
    };
  }

  async seedDefault() {
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: TransactionType.INCOME, icon: 'cash-multiple', color: '#4CAF50', isDefault: true },
      { name: 'Freelance', type: TransactionType.INCOME, icon: 'laptop', color: '#8BC34A', isDefault: true },
      { name: 'Investment', type: TransactionType.INCOME, icon: 'chart-line', color: '#66BB6A', isDefault: true },
      { name: 'Gift', type: TransactionType.INCOME, icon: 'gift', color: '#81C784', isDefault: true },
      { name: 'Other Income', type: TransactionType.INCOME, icon: 'cash', color: '#9CCC65', isDefault: true },

      // Expense categories
      { name: 'Groceries', type: TransactionType.EXPENSE, icon: 'cart', color: '#FF5722', isDefault: true },
      { name: 'Transportation', type: TransactionType.EXPENSE, icon: 'car', color: '#FF9800', isDefault: true },
      { name: 'Utilities', type: TransactionType.EXPENSE, icon: 'lightning-bolt', color: '#FFC107', isDefault: true },
      { name: 'Rent', type: TransactionType.EXPENSE, icon: 'home', color: '#F44336', isDefault: true },
      { name: 'Healthcare', type: TransactionType.EXPENSE, icon: 'medical-bag', color: '#E91E63', isDefault: true },
      { name: 'Entertainment', type: TransactionType.EXPENSE, icon: 'movie', color: '#9C27B0', isDefault: true },
      { name: 'Dining Out', type: TransactionType.EXPENSE, icon: 'silverware-fork-knife', color: '#FF6F00', isDefault: true },
      { name: 'Shopping', type: TransactionType.EXPENSE, icon: 'shopping', color: '#E040FB', isDefault: true },
      { name: 'Education', type: TransactionType.EXPENSE, icon: 'school', color: '#3F51B5', isDefault: true },
      { name: 'Insurance', type: TransactionType.EXPENSE, icon: 'shield-check', color: '#2196F3', isDefault: true },
      { name: 'Other Expense', type: TransactionType.EXPENSE, icon: 'dots-horizontal', color: '#607D8B', isDefault: true },
    ];

    const createdCategories = [];
    for (const categoryData of defaultCategories) {
      // Check if category already exists
      const existing = await this.prisma.category.findFirst({
        where: {
          name: categoryData.name,
          type: categoryData.type,
        },
      });

      if (!existing) {
        const category = await this.prisma.category.create({
          data: categoryData,
        });
        createdCategories.push(category);
      }
    }

    return {
      data: {
        created: createdCategories.length,
        total: defaultCategories.length,
      },
      message: `Default categories seeded successfully. Created ${createdCategories.length} new categories.`,
    };
  }
}
