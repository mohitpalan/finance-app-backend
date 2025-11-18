# API Testing Documentation Index

Welcome! This directory contains comprehensive API testing utilities for the Finance App backend.

## Quick Links

### I just want to test the API
Start here: **[QUICK_TEST.md](./QUICK_TEST.md)** - 5-minute setup and run guide

### I need comprehensive documentation
Read this: **[API_TEST_GUIDE.md](./API_TEST_GUIDE.md)** - Full reference guide

### I want to understand the implementation
Check this: **[TEST_SCRIPT_SUMMARY.md](./TEST_SCRIPT_SUMMARY.md)** - Technical overview

### I want to see what success looks like
View this: **[TEST_RUN_EXAMPLE.txt](./TEST_RUN_EXAMPLE.txt)** - Example output

### I want to run the tests now
Run this: **[test-api-endpoints.js](./test-api-endpoints.js)** - The main test script

---

## File Overview

### Test Scripts
- **test-api-endpoints.js** (603 lines)
  - Main test automation script
  - Uses Node.js built-in modules only (no dependencies)
  - Runs 13 comprehensive API endpoint tests
  - Colored console output with detailed reporting
  - Exit codes for CI/CD integration

### Documentation Files
1. **QUICK_TEST.md**
   - Setup in 5 minutes
   - Installation steps
   - Running tests
   - Troubleshooting quick answers
   - Best for: Getting started quickly

2. **API_TEST_GUIDE.md**
   - Comprehensive reference
   - All endpoints documented
   - Test coverage breakdown
   - CI/CD integration examples
   - Performance baselines
   - Custom test examples
   - Best for: Complete understanding

3. **TEST_SCRIPT_SUMMARY.md**
   - Implementation details
   - Architecture overview
   - Code organization
   - Test framework explanation
   - Configuration options
   - Best for: Understanding internals

4. **TEST_RUN_EXAMPLE.txt**
   - Real example output
   - All test sections shown
   - Expected responses
   - Success indicators
   - Best for: Seeing what success looks like

5. **README_TESTING.md** (this file)
   - Navigation guide
   - Documentation index
   - Quick reference
   - Best for: Finding what you need

---

## What Gets Tested

### 13 Total Test Cases

**Authentication (3)**
- User login
- Admin login
- Get current user

**Resources (10)**
- Health check
- Categories (16 seeded)
- Transactions (12 seeded)
- Transaction statistics
- Budgets (4 seeded)
- Dashboard
- User profile
- Get all users (admin)
- Authorization check

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Backend source code

### 3-Step Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Setup Database
```bash
npm run prisma:migrate
npm run prisma:seed
```

#### 3. Run Backend Server (new terminal)
```bash
npm run backend:dev
```

#### 4. Run Tests (in backend directory)
```bash
npm run test:api
```

That's it! You should see colored test output.

---

## Common Tasks

### Run Tests from Root
```bash
npm run backend:test:api
```

### Run Tests from Backend
```bash
cd backend
npm run test:api
```

### Run Tests Directly
```bash
node backend/test-api-endpoints.js
```

### Run with Specific Config
Edit these constants in `test-api-endpoints.js`:
```javascript
const API_HOST = 'localhost';
const API_PORT = 3000;
const TIMEOUT = 5000;
```

### View Test Credentials
Regular User: `user@financeapp.com` / `User123!`
Admin User: `admin@financeapp.com` / `Admin123!`

---

## Test Output Interpretation

### Success Indicators
```
✓ PASS: Test Name - Details
Pass Rate: 100.00%
ALL TESTS PASSED!
```

### Failure Indicators
```
✗ FAIL: Test Name - Error message
Pass Rate: XX.XX%
N TEST(S) FAILED
```

### Color Meanings
- **Green**: Passed tests
- **Red**: Failed tests
- **Yellow**: Warnings
- **Blue**: Section headers
- **Cyan**: Main title
- **Dim**: Request/response details

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Connection refused" | Start backend: `npm run backend:dev` |
| "Authentication failed" | Seed data: `npm run prisma:seed` |
| "Categories not found" | Check database: `npm run prisma:seed` |
| "Timeout" | Increase TIMEOUT in script or check logs |
| "Database locked" | Kill all backends, restart |

For detailed troubleshooting: See **API_TEST_GUIDE.md** → Troubleshooting section

---

## Architecture Overview

```
test-api-endpoints.js
├── makeRequest() - HTTP client
├── Test Functions
│   ├── testHealthCheck()
│   ├── testAuthentication()
│   ├── testCategories()
│   ├── testTransactions()
│   ├── testBudgets()
│   ├── testDashboard()
│   ├── testUserProfile()
│   └── testAdminEndpoints()
├── Helper Functions
│   ├── log(), logHeader(), logSubHeader()
│   ├── logRequest(), logResponse()
│   └── logTestResult()
└── Main Runner
    ├── runAllTests()
    └── printTestSummary()
```

For detailed architecture: See **TEST_SCRIPT_SUMMARY.md**

---

## API Endpoints Tested

### Health & Auth (4 endpoints)
- `GET /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/login` - Admin login (same endpoint)
- `GET /auth/me` - Current user

### Data Endpoints (9 endpoints)
- `GET /categories` - All categories
- `GET /transactions` - All transactions
- `GET /transactions/statistics` - Transaction stats
- `GET /budgets` - All budgets
- `GET /dashboard` - Dashboard stats
- `GET /users/profile` - User profile
- `GET /users` - All users (admin only)
- Plus authorization checks

For full endpoint reference: See **API_TEST_GUIDE.md** → API Endpoint Reference

---

## Integration Examples

### GitHub Actions
```yaml
- name: Run API Tests
  run: |
    npm install
    npm run backend:dev &
    sleep 3
    npm run backend:test:api
```

### Local CI Pipeline
```bash
#!/bin/bash
npm run backend:dev &
sleep 2
npm run backend:test:api
EXIT_CODE=$?
pkill -f "npm run backend:dev"
exit $EXIT_CODE
```

For more examples: See **API_TEST_GUIDE.md** → CI/CD Integration

---

## Performance Expectations

Typical test execution times:
- Health check: 50ms
- Login: 100-200ms
- Category list: 50-100ms
- Transaction list: 100-150ms
- Dashboard: 150-200ms
- Admin endpoints: 100-250ms

**Total execution: 5-10 seconds**

---

## Documentation Structure

```
Level 1: Quick Start
  └─ QUICK_TEST.md (5-minute guide)

Level 2: Usage Reference
  └─ API_TEST_GUIDE.md (comprehensive reference)

Level 3: Implementation Details
  └─ TEST_SCRIPT_SUMMARY.md (technical deep dive)

Level 4: Examples & Verification
  └─ TEST_RUN_EXAMPLE.txt (real output example)

Level 5: Navigation
  └─ README_TESTING.md (this file)
```

Each level builds on the previous, but you can start anywhere based on your need.

---

## Extending the Tests

### Add a New Test
1. Create test function:
```javascript
async function testNewEndpoint(userToken) {
  logSubHeader('New Test Section');
  try {
    const response = await makeRequest('GET', '/new-endpoint', null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);
    const passed = response.status === 200;
    logTestResult('New Test Name', passed);
  } catch (error) {
    logTestResult('New Test Name', false, error.message);
  }
}
```

2. Call in `runAllTests()`:
```javascript
await testNewEndpoint(userToken);
```

For more details: See **API_TEST_GUIDE.md** → Adding Custom Tests

---

## Support & Help

### Need Quick Answer?
→ Check **QUICK_TEST.md** troubleshooting section

### Need Detailed Help?
→ Read **API_TEST_GUIDE.md** troubleshooting section

### Want to Understand Code?
→ Study **TEST_SCRIPT_SUMMARY.md** architecture

### Want to See Examples?
→ Review **TEST_RUN_EXAMPLE.txt** output

### Still Stuck?
1. Check backend logs: `npm run backend:dev`
2. Visit API docs: http://localhost:3000/api/docs
3. Review backend code: `backend/src/modules/`
4. Check CLAUDE.md for project overview

---

## File Manifest

### Backend Directory Files
```
backend/
├── test-api-endpoints.js        ← Main test script (run this!)
├── QUICK_TEST.md               ← Quick start guide
├── API_TEST_GUIDE.md           ← Full documentation
├── TEST_SCRIPT_SUMMARY.md      ← Implementation details
├── TEST_RUN_EXAMPLE.txt        ← Example output
├── README_TESTING.md           ← This file
├── package.json                ← Updated with test:api script
└── ... (other backend files)
```

### Root Directory Files
```
package.json                     ← Updated with backend:test:api script
```

---

## Quick Command Reference

```bash
# Setup
npm install                      # Install dependencies
npm run prisma:migrate          # Setup database
npm run prisma:seed             # Seed test data

# Development
npm run backend:dev             # Start backend server
npm run backend:test:api        # Run API tests (from root)

# Backend Directory Only
cd backend
npm run test:api                # Run tests
npm run dev                     # Start server
npm run prisma:studio           # Open database UI

# Other Tests
npm run backend:test            # Unit tests
npm run backend:test:e2e        # End-to-end tests
npm run backend:test:cov        # Test coverage
```

---

## Version Information

- **Test Script Version**: 1.0.0
- **Created**: 2024-11-17
- **Node.js Required**: 18.0.0+
- **npm Required**: 9.0.0+

## What's New

- Comprehensive API testing script
- Zero external dependencies (uses Node.js built-in modules)
- Color-coded console output
- 13 test cases covering all major endpoints
- Three levels of documentation
- CI/CD integration examples
- Performance baseline expectations

---

## Next Steps

1. **Quick Start** (5 min):
   - Read QUICK_TEST.md
   - Run tests

2. **Deep Dive** (15 min):
   - Read API_TEST_GUIDE.md
   - Review TEST_RUN_EXAMPLE.txt

3. **Integration** (ongoing):
   - Integrate into CI/CD
   - Add custom tests
   - Monitor performance

4. **Documentation**:
   - Frontend Integration: `../mobile/README.md`
   - Backend Architecture: `../docs/ARCHITECTURE.md`
   - API Design: `../docs/API_GUIDELINES.md`

---

## Summary

You now have:
- A complete API testing script
- Three levels of documentation
- Example output for reference
- Quick setup guide
- Troubleshooting guides
- CI/CD integration examples

Everything you need to test and validate the Finance App backend API!

---

**Ready to test?** Start with [QUICK_TEST.md](./QUICK_TEST.md) →

**Have questions?** Check [API_TEST_GUIDE.md](./API_TEST_GUIDE.md) →

**Want details?** Read [TEST_SCRIPT_SUMMARY.md](./TEST_SCRIPT_SUMMARY.md) →

---

*Last Updated: 2024-11-17*
*Documentation Version: 1.0.0*
