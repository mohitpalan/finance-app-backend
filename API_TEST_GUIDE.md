# API Testing Guide

This guide explains how to use the comprehensive API testing script for the Finance App backend.

## Overview

The `test-api-endpoints.js` script provides automated testing for all major API endpoints, including:

- **Health Check** - Verify API server is running
- **Authentication** - Login for both admin and regular users
- **Categories** - Retrieve all seeded categories (16 total: 5 income, 11 expense)
- **Transactions** - Get all transactions and statistics
- **Budgets** - Retrieve all budgets with period filtering
- **Dashboard** - Get comprehensive dashboard statistics
- **User Profile** - Retrieve authenticated user profile
- **Admin-Only Endpoints** - Test access control on restricted endpoints

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js 18+** installed
2. **Backend dependencies installed**:
   ```bash
   cd backend
   npm install
   ```

3. **Database set up and seeded**:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Backend server running** (in another terminal):
   ```bash
   npm run backend:dev
   # Server will start at http://localhost:3000
   ```

## Running the Tests

### From the backend directory:
```bash
node test-api-endpoints.js
```

### From the root directory:
```bash
npm run backend:test:api
```

## Test Credentials

The script uses the following seeded credentials:

### Regular User
- **Email**: `user@financeapp.com`
- **Password**: `User123!`
- **Role**: USER

### Admin User
- **Email**: `admin@financeapp.com`
- **Password**: `Admin123!`
- **Role**: ADMIN

## Test Coverage

### 1. Health Check
- **Endpoint**: `GET /health`
- **Access**: Public
- **Verifies**: API server is running and database is connected

### 2. Authentication Tests
- **Login (User)**: `POST /auth/login` - Regular user login
- **Login (Admin)**: `POST /auth/login` - Admin user login
- **Get Current User**: `GET /auth/me` - Retrieve authenticated user info

**Expected Results**:
- Login returns HTTP 200 with access token
- Current user endpoint requires Bearer token

### 3. Categories Tests
- **Endpoint**: `GET /categories`
- **Access**: Requires authentication
- **Expected Data**:
  - Total: 16 categories
  - Income: 5 (Salary, Freelance, Investments, Gifts, Other Income)
  - Expense: 11 (Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Groceries, Rent, Other Expense)

### 4. Transactions Tests
- **Get All Transactions**: `GET /transactions`
  - Supports filtering by type, category, date range, amount
  - Includes pagination (page, limit)
  - Sorting by date, amount, etc.
  - Expected: 12 seeded transactions

- **Get Statistics**: `GET /transactions/statistics`
  - Returns total income, expenses, and net income
  - Supports date range filtering
  - Includes category breakdown

### 5. Budgets Tests
- **Endpoint**: `GET /budgets`
- **Access**: Requires authentication
- **Expected Data**:
  - 4 seeded budgets
  - Periods: MONTHLY or YEARLY
  - Categories: Groceries, Transportation, Entertainment, Food & Dining
  - Progress tracking (spent vs. limit)

### 6. Dashboard Tests
- **Endpoint**: `GET /dashboard`
- **Access**: Requires authentication
- **Returns**:
  - Total income and expenses
  - Net income (income - expenses)
  - Accounts balance
  - Recent transactions (last 5-10)
  - Monthly trend data (12 months)

### 7. User Profile Tests
- **Get Profile**: `GET /users/profile`
  - Returns authenticated user's profile
  - Includes email, name, role, and status

### 8. Admin-Only Endpoints
- **Get All Users**: `GET /users`
  - Admin only (403 Forbidden for regular users)
  - Returns all users with their roles and status

- **Authorization Check**:
  - Verifies that regular users cannot access admin endpoints
  - Tests RBAC (Role-Based Access Control)

## Output Format

The test script provides detailed console output with color coding:

```
================================================================================
FINANCE APP API ENDPOINT TESTS
Testing API at: http://localhost:3000/api/v1
Timestamp: 2024-11-17T10:30:45.123Z
================================================================================

--------------------------------------------------------------------------------
Health Check
--------------------------------------------------------------------------------
REQUEST: GET /health
RESPONSE: 200 OK
DATA: { success: true, data: { status: 'healthy', ... } }
✓ PASS: Health Check

--------------------------------------------------------------------------------
Authentication Tests
--------------------------------------------------------------------------------
REQUEST: POST /auth/login
BODY: { email: 'user@financeapp.com', password: '***' }
RESPONSE: 200 OK
DATA: { success: true, data: { accessToken: '...' } }
✓ PASS: User Login

...
```

### Color Coding
- **Green**: Passed tests
- **Red**: Failed tests
- **Yellow**: Warnings or informational messages
- **Blue**: Test section headers
- **Cyan**: Main header
- **Dim**: Request/response details

## Troubleshooting

### "Connection refused" error
- Ensure the backend server is running: `npm run backend:dev`
- Check that it's running on `http://localhost:3000`

### "Authentication failed" error
- Verify database is seeded: `npm run prisma:seed`
- Check that `user@financeapp.com` and `admin@financeapp.com` exist
- Verify passwords match those in the seed script

### "Category/Transaction not found" errors
- Run `npm run prisma:seed` to populate test data
- Verify SQLite database file exists at `backend/prisma/dev.db`

### "Database locked" error
- Stop all running backend instances
- Remove `backend/prisma/dev.db` if corrupted
- Run migrations again: `npm run prisma:migrate`

### Some tests timeout
- Increase timeout value in script (modify `TIMEOUT` constant)
- Check backend logs for errors
- Verify system resources (CPU, memory)

## CI/CD Integration

To integrate this script into your CI/CD pipeline:

```bash
#!/bin/bash
set -e

# Start backend in background
npm run backend:dev &
BACKEND_PID=$!

# Wait for server to be ready
sleep 3

# Run tests
node backend/test-api-endpoints.js
TEST_RESULT=$?

# Kill backend
kill $BACKEND_PID

exit $TEST_RESULT
```

## Adding Custom Tests

To add more test cases, modify the script:

```javascript
async function testCustomEndpoint(userToken) {
  logSubHeader('Custom Test');

  try {
    const endpoint = '/your-endpoint';
    log('Testing your endpoint...', 'bright');
    logRequest('GET', endpoint);

    const response = await apiClient.get(endpoint, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200;
    logTestResult('Your Test Name', passed);
  } catch (error) {
    logTestResult('Your Test Name', false, error.message);
  }
}

// Add to runAllTests():
await testCustomEndpoint(userToken);
```

## API Endpoint Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Public Endpoints
- `GET /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token

### Authenticated Endpoints
- `GET /auth/me` - Get current user
- `GET /categories` - List categories
- `GET /transactions` - List transactions
- `GET /transactions/statistics` - Transaction stats
- `GET /budgets` - List budgets
- `GET /dashboard` - Dashboard stats
- `GET /users/profile` - User profile

### Admin-Only Endpoints
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /categories/seed` - Seed default categories

## Related Documentation

- **API Documentation**: http://localhost:3000/api/docs (Swagger UI)
- **Architecture Guide**: `docs/ARCHITECTURE.md`
- **API Guidelines**: `docs/API_GUIDELINES.md`
- **Setup Guide**: `docs/GETTING_STARTED.md`

## Performance Baseline

Expected response times (p95):
- Health check: < 50ms
- Login: < 200ms
- Category list: < 100ms
- Transaction list: < 150ms
- Dashboard: < 200ms
- Admin endpoints: < 250ms

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `npm run backend:dev`
3. Check Swagger docs at http://localhost:3000/api/docs
4. Review code in `backend/src/modules/`

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
