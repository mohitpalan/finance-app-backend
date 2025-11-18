# Quick API Test Setup & Run

## 5-Minute Quick Start

### Step 1: Install Dependencies (1 min)
```bash
cd backend
npm install
```

### Step 2: Setup Database (2 min)
```bash
npm run prisma:migrate
npm run prisma:seed
```

Output should show:
```
✓ Created/updated income category: Salary
✓ Created/updated income category: Freelance
...
✓ Created/updated test user: user@financeapp.com
✓ Created/updated admin user: admin@financeapp.com
✓ Created transaction: INCOME 5000.00 - Monthly salary
...
```

### Step 3: Start Backend Server (in a new terminal)
```bash
npm run backend:dev
```

Wait for output:
```
[Nest] 12345 - 11/17/2024 10:30:45     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 11/17/2024 10:30:45     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345 - 11/17/2024 10:30:45     LOG Server running on port 3000
```

### Step 4: Run API Tests (from backend directory)
```bash
# Option A: Using npm script
npm run test:api

# Option B: Using node directly
node test-api-endpoints.js

# Option C: From root directory
npm run backend:test:api
```

## Expected Output

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
✓ PASS: Health Check

--------------------------------------------------------------------------------
Authentication Tests
--------------------------------------------------------------------------------
REQUEST: POST /auth/login
RESPONSE: 200 OK
✓ PASS: User Login

REQUEST: POST /auth/login
RESPONSE: 200 OK
✓ PASS: Admin Login

REQUEST: GET /auth/me
RESPONSE: 200 OK
✓ PASS: Get Current User

...

================================================================================
TEST SUMMARY
================================================================================

Total Tests: 13
Passed: 13
Failed: 0
Pass Rate: 100.00%

================================================================================
ALL TESTS PASSED!
================================================================================
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Start backend with `npm run backend:dev` |
| "Authentication failed" | Run `npm run prisma:seed` to create test users |
| "Categories not found" | Seed database: `npm run prisma:seed` |
| "Timeout" | Check backend logs, increase timeout in script |
| "Database locked" | Stop all backend instances, restart |

## Test Details

The script tests these 13 endpoints:

**Public Endpoints:**
1. Health Check - `/health`

**Authentication:**
2. User Login - `POST /auth/login`
3. Admin Login - `POST /auth/login`
4. Get Current User - `GET /auth/me`

**User Endpoints:**
5. Get All Categories - `GET /categories` (16 total)
6. Get All Transactions - `GET /transactions` (12 seeded)
7. Get Transaction Statistics - `GET /transactions/statistics`
8. Get All Budgets - `GET /budgets` (4 seeded)
9. Get Dashboard - `GET /dashboard`
10. Get User Profile - `GET /users/profile`

**Admin-Only Endpoints:**
11. Get All Users - `GET /users`
12. Authorization Check - Regular user denied access

**Success Criteria:**
- 100% pass rate
- All endpoints respond within timeout
- Admin endpoints properly restrict access
- Data matches seed expectations

## API Documentation

While tests are running, visit Swagger UI:
```
http://localhost:3000/api/docs
```

## Next Steps

- Read detailed guide: `API_TEST_GUIDE.md`
- Check API endpoints: http://localhost:3000/api/docs
- Review backend architecture: `../docs/ARCHITECTURE.md`
- Integrate tests in CI/CD pipeline

---

That's it! Your API is now tested and ready to use.
