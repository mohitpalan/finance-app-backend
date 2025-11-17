# Backend Setup Guide

This guide will help you set up and run the Finance App backend API.

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (local or remote)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory (already created) and update the database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/finance_app?schema=public"
```

Replace `username`, `password`, and connection details with your PostgreSQL credentials.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

This will create all the necessary tables in your database.

### 5. Seed the Database (Optional)

```bash
npm run prisma:seed
```

This will create:
- Default expense and income categories
- A demo user: `demo@financeapp.com` / `Demo1234!`

### 6. Start the Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api/docs

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:cov` - Run tests with coverage

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── common/            # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   └── interceptors/  # Response interceptors
│   ├── config/            # Configuration files
│   │   ├── logger.config.ts
│   │   └── swagger.config.ts
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── budgets/       # Budgets module
│   │   ├── health/        # Health check module
│   │   ├── prisma/        # Prisma service module
│   │   ├── transactions/  # Transactions module
│   │   └── users/         # Users module
│   ├── app.module.ts      # Root application module
│   └── main.ts            # Application entry point
├── logs/                  # Application logs
└── tests/                 # Test files

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/refresh` - Refresh access token
- POST `/api/v1/auth/logout` - Logout

### Users
- GET `/api/v1/users/profile` - Get current user profile
- PUT `/api/v1/users/profile` - Update profile
- POST `/api/v1/users/change-password` - Change password
- GET `/api/v1/users` - Get all users (Admin only)
- GET `/api/v1/users/:id` - Get user by ID (Admin only)

### Transactions
- GET `/api/v1/transactions` - Get all transactions

### Budgets
- GET `/api/v1/budgets` - Get all budgets

### Health
- GET `/api/v1/health` - Health check

## Testing the API

### Using Swagger UI

1. Navigate to http://localhost:3000/api/docs
2. Click "Authorize" and enter your JWT token
3. Try out the endpoints

### Using curl

Register a user:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in .env file
3. Check database credentials

### Port Already in Use

If port 3000 is in use, change the PORT in .env file:
```env
PORT=3001
```

### Prisma Issues

If you encounter Prisma-related errors:
```bash
npm run prisma:generate
npx prisma migrate reset
npm run prisma:seed
```

## Next Steps

- Implement full CRUD operations for Transactions
- Implement full CRUD operations for Budgets
- Add analytics endpoints
- Add pagination and filtering
- Set up unit and integration tests
