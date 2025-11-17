import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default income categories with emojis and colors
const INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💰', color: '#10b981', isDefault: true },
  { name: 'Freelance', icon: '💼', color: '#3b82f6', isDefault: true },
  { name: 'Investments', icon: '📈', color: '#8b5cf6', isDefault: true },
  { name: 'Gifts', icon: '🎁', color: '#ec4899', isDefault: true },
  { name: 'Other Income', icon: '💵', color: '#6366f1', isDefault: true },
];

// Default expense categories with emojis and colors
const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#ef4444', isDefault: true },
  { name: 'Transportation', icon: '🚗', color: '#f59e0b', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', isDefault: true },
  { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6', isDefault: true },
  { name: 'Healthcare', icon: '🏥', color: '#10b981', isDefault: true },
  { name: 'Education', icon: '📚', color: '#6366f1', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#06b6d4', isDefault: true },
  { name: 'Groceries', icon: '🛒', color: '#84cc16', isDefault: true },
  { name: 'Rent', icon: '🏠', color: '#f97316', isDefault: true },
  { name: 'Other Expense', icon: '📝', color: '#64748b', isDefault: true },
];

async function seedCategories() {
  console.log('Creating default income categories...');
  for (const category of INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: 'INCOME',
        },
      },
      update: {
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
      },
      create: {
        name: category.name,
        type: 'INCOME',
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
      },
    });
    console.log(`✓ Created/updated income category: ${category.name}`);
  }

  console.log('Creating default expense categories...');
  for (const category of EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: 'EXPENSE',
        },
      },
      update: {
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
      },
      create: {
        name: category.name,
        type: 'EXPENSE',
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
      },
    });
    console.log(`✓ Created/updated expense category: ${category.name}`);
  }
}

async function seedUsers() {
  console.log('\nCreating users...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@financeapp.com' },
    update: {
      password: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@financeapp.com',
      password: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✓ Created/updated admin user: ${admin.email}`);

  // Create test user
  const userPasswordHash = await bcrypt.hash('User123!', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@financeapp.com' },
    update: {
      password: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
    },
    create: {
      email: 'user@financeapp.com',
      password: userPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      status: 'ACTIVE',
    },
  });
  console.log(`✓ Created/updated test user: ${testUser.email}`);

  return testUser.id;
}

async function seedTransactions(userId: string) {
  console.log('\nCreating sample transactions...');

  // Get all categories
  const salaryCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Salary',
        type: 'INCOME',
      },
    },
  });

  const groceriesCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Groceries',
        type: 'EXPENSE',
      },
    },
  });

  const transportationCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Transportation',
        type: 'EXPENSE',
      },
    },
  });

  const foodCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Food & Dining',
        type: 'EXPENSE',
      },
    },
  });

  const entertainmentCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Entertainment',
        type: 'EXPENSE',
      },
    },
  });

  const billsCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Bills & Utilities',
        type: 'EXPENSE',
      },
    },
  });

  const healthcareCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Healthcare',
        type: 'EXPENSE',
      },
    },
  });

  const shoppingCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Shopping',
        type: 'EXPENSE',
      },
    },
  });

  const freelanceCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Freelance',
        type: 'INCOME',
      },
    },
  });

  const rentCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Rent',
        type: 'EXPENSE',
      },
    },
  });

  // Sample transactions data
  const transactions = [
    {
      userId,
      amount: '5000.00',
      type: 'INCOME',
      categoryId: salaryCategory?.id || '',
      description: 'Monthly salary',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
    {
      userId,
      amount: '150.50',
      type: 'EXPENSE',
      categoryId: groceriesCategory?.id || '',
      description: 'Weekly groceries',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    },
    {
      userId,
      amount: '45.00',
      type: 'EXPENSE',
      categoryId: transportationCategory?.id || '',
      description: 'Gas refill',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 6),
    },
    {
      userId,
      amount: '85.75',
      type: 'EXPENSE',
      categoryId: foodCategory?.id || '',
      description: 'Dinner at restaurant',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    },
    {
      userId,
      amount: '1200.00',
      type: 'EXPENSE',
      categoryId: rentCategory?.id || '',
      description: 'Monthly rent payment',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
    {
      userId,
      amount: '65.00',
      type: 'EXPENSE',
      categoryId: entertainmentCategory?.id || '',
      description: 'Movie tickets',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    },
    {
      userId,
      amount: '120.00',
      type: 'EXPENSE',
      categoryId: billsCategory?.id || '',
      description: 'Electricity bill',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    },
    {
      userId,
      amount: '500.00',
      type: 'INCOME',
      categoryId: freelanceCategory?.id || '',
      description: 'Freelance project payment',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    },
    {
      userId,
      amount: '78.90',
      type: 'EXPENSE',
      categoryId: healthcareCategory?.id || '',
      description: 'Pharmacy medicines',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 14),
    },
    {
      userId,
      amount: '250.00',
      type: 'EXPENSE',
      categoryId: shoppingCategory?.id || '',
      description: 'Clothing purchase',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    },
    {
      userId,
      amount: '35.50',
      type: 'EXPENSE',
      categoryId: foodCategory?.id || '',
      description: 'Coffee and lunch',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    },
    {
      userId,
      amount: '2000.00',
      type: 'INCOME',
      categoryId: salaryCategory?.id || '',
      description: 'Bonus payment',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    },
  ];

  for (const transaction of transactions) {
    if (transaction.categoryId) {
      // Check if transaction already exists with similar details
      const existing = await prisma.transaction.findFirst({
        where: {
          userId: transaction.userId,
          categoryId: transaction.categoryId,
          amount: transaction.amount,
          date: transaction.date,
        },
      });

      if (!existing) {
        await prisma.transaction.create({
          data: transaction,
        });
        console.log(
          `✓ Created transaction: ${transaction.type} ${transaction.amount} - ${transaction.description}`,
        );
      }
    }
  }

  console.log('Sample transactions created successfully!');
}

async function seedBudgets(userId: string) {
  console.log('\nCreating sample budgets...');

  // Get expense categories for budgets
  const groceriesCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Groceries',
        type: 'EXPENSE',
      },
    },
  });

  const transportationCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Transportation',
        type: 'EXPENSE',
      },
    },
  });

  const entertainmentCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Entertainment',
        type: 'EXPENSE',
      },
    },
  });

  const foodCategory = await prisma.category.findUnique({
    where: {
      name_type: {
        name: 'Food & Dining',
        type: 'EXPENSE',
      },
    },
  });

  // Current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgets = [
    {
      userId,
      categoryId: groceriesCategory?.id || '',
      amount: '400.00',
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth,
    },
    {
      userId,
      categoryId: transportationCategory?.id || '',
      amount: '200.00',
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth,
    },
    {
      userId,
      categoryId: entertainmentCategory?.id || '',
      amount: '150.00',
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth,
    },
    {
      userId,
      categoryId: foodCategory?.id || '',
      amount: '300.00',
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth,
    },
  ];

  for (const budget of budgets) {
    if (budget.categoryId) {
      // Check if budget already exists for this month
      const existing = await prisma.budget.findFirst({
        where: {
          userId: budget.userId,
          categoryId: budget.categoryId,
          period: budget.period,
        },
      });

      if (!existing) {
        await prisma.budget.create({
          data: budget,
        });
        console.log(
          `✓ Created budget: ${budget.amount} for category (${budget.period})`,
        );
      }
    }
  }

  console.log('Sample budgets created successfully!');
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');

    await seedCategories();
    const userId = await seedUsers();
    await seedTransactions(userId);
    await seedBudgets(userId);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Seeded data summary:');
    console.log('   - Income categories: 5');
    console.log('   - Expense categories: 11');
    console.log('   - Admin user: admin@financeapp.com / Admin123!');
    console.log('   - Test user: user@financeapp.com / User123!');
    console.log('   - Sample transactions: 12');
    console.log('   - Sample budgets: 4');
  } catch (e) {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
