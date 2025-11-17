import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    // Get all user transactions
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === 'INCOME') {
        totalIncome += amount;
      } else if (transaction.type === 'EXPENSE') {
        totalExpenses += amount;
      }
    });

    const netIncome = totalIncome - totalExpenses;
    const accountsBalance = netIncome; // Same as netIncome for now

    // Get recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    // Calculate monthly trend for last 6 months
    const monthlyTrend = this.calculateMonthlyTrend(transactions);

    return {
      data: {
        totalIncome,
        totalExpenses,
        netIncome,
        accountsBalance,
        recentTransactions,
        monthlyTrend,
      },
      message: 'Dashboard statistics retrieved successfully',
    };
  }

  private calculateMonthlyTrend(transactions: any[]) {
    // Get current date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months including current

    // Initialize monthly data
    const monthlyData: Map<string, { month: string; income: number; expenses: number }> = new Map();

    // Create entries for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      monthlyData.set(monthKey, {
        month: monthName,
        income: 0,
        expenses: 0,
      });
    }

    // Aggregate transactions by month
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        const amount = Number(transaction.amount);

        if (transaction.type === 'INCOME') {
          data.income += amount;
        } else if (transaction.type === 'EXPENSE') {
          data.expenses += amount;
        }
      }
    });

    // Convert to array
    return Array.from(monthlyData.values());
  }
}
