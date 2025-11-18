# Finance App - Backend API

NestJS-based REST API for the Finance App.

## Overview

This is the backend API service built with NestJS framework, providing RESTful endpoints for the mobile and admin applications.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: TBD (PostgreSQL/MySQL recommended)
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── modules/             # Feature modules
│   ├── common/              # Shared utilities, guards, interceptors
│   ├── config/              # Configuration files
│   └── database/            # Database configuration and migrations
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Database (PostgreSQL/MySQL)

## Installation

From the root directory:
```bash
npm install
```

Or install backend dependencies only:
```bash
npm install --workspace=backend
```

## Configuration

Create a `.env` file in the backend directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=finance_app

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRATION=3600

# API
API_PREFIX=api/v1
```

## Development

Start the development server:
```bash
npm run backend:dev
```

The API will be available at `http://localhost:3000`

## Testing

Run all tests:
```bash
npm run backend:test
```

Run tests with coverage:
```bash
npm run backend:test:cov
```

Run e2e tests:
```bash
npm run backend:test:e2e
```

## Building

Build for production:
```bash
npm run backend:build
```

## API Documentation

Once the server is running, API documentation will be available at:
- Swagger UI: `http://localhost:3000/api/docs`

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio GUI

## Key Features (To Be Implemented)

- User authentication and authorization
- Financial transactions management
- Account management
- Budget tracking
- Reporting and analytics
- Notification system
- Admin operations

## Database Setup

### Initialize Database

The project uses Prisma ORM with SQLite for development:

1. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

2. Run migrations to create database tables:
   ```bash
   npm run prisma:migrate
   ```

3. Seed the database with initial data:
   ```bash
   npm run prisma:seed
   ```

### Database Seeding

The seed script (`prisma/seed.ts`) automatically creates:

**Default Categories:**
- 5 Income categories: Salary, Freelance, Investments, Gifts, Other Income
- 11 Expense categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Groceries, Rent, Other Expense

**Users:**
- Admin user: `admin@financeapp.com` / `Admin123!` (role: ADMIN)
- Test user: `user@financeapp.com` / User123!` (role: USER)

**Sample Data:**
- 12 sample transactions for the test user (income and expenses)
- 4 monthly budgets for tracking spending limits

All categories include emoji icons and custom colors for better UI presentation.

### Database Location

- Development database: `backend/prisma/dev.db`
- Note: SQLite is used for development. For production, migrate to PostgreSQL.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation using class-validator
- CORS configuration
- Rate limiting
- Helmet for security headers

## Contributing

1. Create feature branch
2. Write tests for new features
3. Ensure all tests pass
4. Follow NestJS best practices
5. Submit pull request

## License

MIT
