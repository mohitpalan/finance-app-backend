# Finance App - Backend API

NestJS-based REST API for the Finance App ecosystem.

## Overview

Production-ready backend API service built with NestJS framework, providing RESTful endpoints for the mobile and admin applications. Features JWT authentication, Prisma ORM with SQLite, and comprehensive API documentation.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma 5.x
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Winston

## Project Structure

```
finance-app-backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication (login, register, JWT)
│   │   ├── users/          # User management
│   │   ├── transactions/   # Financial transactions
│   │   ├── categories/     # Transaction categories
│   │   ├── budgets/        # Budget management
│   │   ├── dashboard/      # Dashboard statistics
│   │   ├── health/         # Health check endpoint
│   │   └── prisma/         # Prisma database service
│   └── common/              # Shared utilities
│       ├── decorators/     # Custom decorators (@CurrentUser, @Roles, @Public)
│       ├── interceptors/   # Response transformation, logging
│       ├── filters/        # Global exception handling
│       └── enums/          # Shared enumerations
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Database seeding script
│   └── dev.db              # SQLite database file
├── tests/                   # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
cd finance-app-backend
npm install
```

## Configuration

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3000
API_PREFIX=api/v1

# CORS
CORS_ORIGIN=http://localhost:3001
```

## Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed

# Open Prisma Studio (GUI)
npm run prisma:studio
```

### Seeded Data

The seed script creates:

**Categories (16 total):**
- Income: Salary, Freelance, Investments, Gifts, Other Income
- Expense: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Groceries, Rent, Other Expense

**Test Users:**
- Admin: `admin@financeapp.com` / `Admin123!` (role: ADMIN)
- User: `user@financeapp.com` / `User123!` (role: USER)

**Sample Data:**
- 12 sample transactions (6 months of data)
- 4 monthly budgets

## Development

```bash
# Start development server with hot-reload
npm run dev

# The API will be available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (returns JWT tokens)
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Transactions
- `GET /api/v1/transactions` - List transactions (with filters)
- `GET /api/v1/transactions/:id` - Get transaction by ID
- `POST /api/v1/transactions` - Create transaction
- `PATCH /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction
- `GET /api/v1/transactions/statistics` - Get transaction statistics

### Categories
- `GET /api/v1/categories` - List categories (filter by type)
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Budgets
- `GET /api/v1/budgets` - List user budgets
- `GET /api/v1/budgets/:id` - Get budget by ID
- `POST /api/v1/budgets` - Create budget
- `PATCH /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard statistics

### Health
- `GET /api/v1/health` - Health check endpoint

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run API endpoint tests
npm run test:api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm test` - Run unit tests
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Global validation pipe with whitelist
- Helmet for security headers
- CORS configuration
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Global exception filter

## Global Configuration

Applied in `main.ts`:
- API prefix: `api/v1`
- Global validation pipe (whitelist, transform)
- Global exception filter
- Transform and logging interceptors
- Swagger documentation at `/api/docs`

## License

MIT
