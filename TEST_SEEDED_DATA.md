# Testing Seeded Data - API Examples

This document provides examples of API calls to test and verify the seeded database data.

## Prerequisites

1. Start the backend server:
   ```bash
   npm run backend:dev
   ```

2. The API will be available at: `http://localhost:3000/api/v1/`

## Authentication

First, you need to get an access token:

### 1. Login as Test User

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@financeapp.com",
    "password": "User123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@financeapp.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "USER",
      "status": "ACTIVE"
    }
  },
  "message": "Login successful"
}
```

Save the `accessToken` for subsequent requests.

### 2. Login as Admin User

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@financeapp.com",
    "password": "Admin123!"
  }'
```

## Test Seeded Categories

### Get All Categories

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "name": "Salary",
      "type": "INCOME",
      "icon": "💰",
      "color": "#10b981",
      "isDefault": true,
      "createdAt": "2025-11-17T...",
      "updatedAt": "2025-11-17T..."
    },
    {
      "id": "category-uuid",
      "name": "Food & Dining",
      "type": "EXPENSE",
      "icon": "🍽️",
      "color": "#ef4444",
      "isDefault": true,
      "createdAt": "2025-11-17T...",
      "updatedAt": "2025-11-17T..."
    },
    ...
  ],
  "message": "Categories retrieved successfully"
}
```

### Get Income Categories

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/categories?type=INCOME" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Expense Categories

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/categories?type=EXPENSE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test Seeded Transactions

### Get All Transactions

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "amount": "5000.00",
      "type": "INCOME",
      "description": "Monthly salary",
      "date": "2025-11-01T00:00:00.000Z",
      "category": {
        "id": "category-uuid",
        "name": "Salary",
        "type": "INCOME",
        "icon": "💰",
        "color": "#10b981"
      },
      "createdAt": "2025-11-17T...",
      "updatedAt": "2025-11-17T..."
    },
    {
      "id": "transaction-uuid",
      "amount": "150.50",
      "type": "EXPENSE",
      "description": "Weekly groceries",
      "date": "2025-11-05T00:00:00.000Z",
      "category": {
        "id": "category-uuid",
        "name": "Groceries",
        "type": "EXPENSE",
        "icon": "🛒",
        "color": "#84cc16"
      },
      "createdAt": "2025-11-17T...",
      "updatedAt": "2025-11-17T..."
    },
    ...
  ],
  "message": "Transactions retrieved successfully"
}
```

### Get Expenses Only

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/transactions?type=EXPENSE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Transactions by Category

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/transactions?categoryId=CATEGORY_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Transactions with Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/transactions?page=1&limit=5&sort=-date" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test Seeded Budgets

### Get All Budgets

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/budgets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "budget-uuid",
      "amount": "400.00",
      "period": "MONTHLY",
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T00:00:00.000Z",
      "category": {
        "id": "category-uuid",
        "name": "Groceries",
        "type": "EXPENSE",
        "icon": "🛒",
        "color": "#84cc16"
      },
      "createdAt": "2025-11-17T...",
      "updatedAt": "2025-11-17T..."
    },
    ...
  ],
  "message": "Budgets retrieved successfully"
}
```

### Get Budget by Category

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/budgets?categoryId=CATEGORY_UUID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Test User Profile

### Get Current User Profile

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@financeapp.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2025-11-17T...",
    "updatedAt": "2025-11-17T..."
  },
  "message": "User profile retrieved successfully"
}
```

## Test Dashboard Data

### Get Dashboard Summary

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (example):**
```json
{
  "success": true,
  "data": {
    "totalIncome": "7500.00",
    "totalExpense": "3363.65",
    "netBalance": "4136.35",
    "transactionCount": 12,
    "budgetCount": 4,
    "recentTransactions": [
      {
        "id": "transaction-uuid",
        "amount": "2000.00",
        "type": "INCOME",
        "description": "Bonus payment",
        "category": {
          "name": "Salary",
          "icon": "💰"
        },
        "date": "2025-11-25T00:00:00.000Z"
      },
      ...
    ]
  },
  "message": "Dashboard data retrieved successfully"
}
```

## Data Verification Checklist

After running the seed script and these API tests, verify:

- [ ] **Categories Created (16 total)**
  - [ ] 5 Income categories with correct icons and colors
  - [ ] 11 Expense categories with correct icons and colors
  - [ ] All marked as `isDefault: true`

- [ ] **Users Created (2 total)**
  - [ ] Admin user: `admin@financeapp.com` / `Admin123!` (role: ADMIN)
  - [ ] Test user: `user@financeapp.com` / `User123!` (role: USER)

- [ ] **Transactions Created (12 total for test user)**
  - [ ] 3 income transactions (Salary x2, Freelance x1): $7,500 total
  - [ ] 9 expense transactions: $3,363.65 total
  - [ ] All transactions have proper category references
  - [ ] All transactions have dates in current month
  - [ ] All transactions have descriptions

- [ ] **Budgets Created (4 total for test user)**
  - [ ] Groceries: $400/month
  - [ ] Transportation: $200/month
  - [ ] Entertainment: $150/month
  - [ ] Food & Dining: $300/month
  - [ ] All budgets have current month date range

## Troubleshooting

### 401 Unauthorized
- Ensure you're including the correct access token in the Authorization header
- The token should be: `Authorization: Bearer <your_access_token>`

### 404 Not Found
- Verify the API endpoint path is correct
- Check that resources exist in the database

### 500 Internal Server Error
- Check the backend console for error messages
- Verify the database connection is working
- Ensure all migrations have been run

### Empty Response
- Verify the seed script ran successfully
- Check the database using Prisma Studio: `npm run prisma:studio`
- Confirm you're authenticated as the correct user

## API Documentation

For complete API documentation, visit:
```
http://localhost:3000/api/docs
```

This provides an interactive Swagger UI with all available endpoints and their documentation.
