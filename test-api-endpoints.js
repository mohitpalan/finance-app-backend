const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_PREFIX = '/api/v1';
const TIMEOUT = 5000;

// Test credentials
const TEST_USERS = {
  admin: {
    email: 'admin@financeapp.com',
    password: 'Admin123!',
    name: 'Admin User'
  },
  user: {
    email: 'user@financeapp.com',
    password: 'User123!',
    name: 'Test User'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test state
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(text) {
  console.log('\n' + '='.repeat(80));
  log(text, 'cyan');
  console.log('='.repeat(80));
}

function logSubHeader(text) {
  console.log('\n' + '-'.repeat(80));
  log(text, 'blue');
  console.log('-'.repeat(80));
}

function logRequest(method, endpoint, data = null) {
  log(`REQUEST: ${colors.bright}${method} ${endpoint}${colors.reset}`, 'dim');
  if (data) {
    log(`BODY: ${JSON.stringify(data, null, 2)}`, 'dim');
  }
}

function logResponse(status, statusText, data = null) {
  const statusColor = status >= 200 && status < 300 ? 'green' : status >= 400 ? 'red' : 'yellow';
  log(`RESPONSE: ${colors[statusColor]}${status} ${statusText}${colors.reset}`);
  if (data) {
    try {
      log(`DATA: ${JSON.stringify(data, null, 2)}`, 'dim');
    } catch (e) {
      log(`DATA: ${data}`, 'dim');
    }
  }
}

function logTestResult(testName, passed, message = '') {
  const result = passed ? 'PASS' : 'FAIL';
  const color = passed ? 'green' : 'red';
  const icon = passed ? '✓' : '✗';
  log(`${icon} ${result}: ${testName}${message ? ` - ${message}` : ''}`, color);

  testResults.tests.push({
    name: testName,
    passed,
    message
  });

  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// HTTP Request utility function
function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PREFIX + endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const data = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data: data,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  logSubHeader('Health Check');

  try {
    const endpoint = '/health';
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint);
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.status === 'healthy';

    logTestResult('Health Check', passed);
    return true;
  } catch (error) {
    logTestResult('Health Check', false, error.message);
    return false;
  }
}

async function testAuthentication() {
  logSubHeader('Authentication Tests');

  let userToken = null;
  let adminToken = null;

  // Test User Login
  try {
    const endpoint = '/auth/login';
    const loginData = {
      email: TEST_USERS.user.email,
      password: TEST_USERS.user.password
    };

    log('\nTesting User Login...', 'bright');
    logRequest('POST', endpoint, loginData);

    const response = await makeRequest('POST', endpoint, loginData);
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.accessToken;

    logTestResult('User Login', passed);

    if (passed) {
      userToken = response.data.data.accessToken;
      log(`Access Token: ${userToken.substring(0, 20)}...`, 'dim');
    }
  } catch (error) {
    logTestResult('User Login', false, error.message);
  }

  // Test Admin Login
  try {
    const endpoint = '/auth/login';
    const loginData = {
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    };

    log('\nTesting Admin Login...', 'bright');
    logRequest('POST', endpoint, loginData);

    const response = await makeRequest('POST', endpoint, loginData);
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.accessToken;

    logTestResult('Admin Login', passed);

    if (passed) {
      adminToken = response.data.data.accessToken;
      log(`Access Token: ${adminToken.substring(0, 20)}...`, 'dim');
    }
  } catch (error) {
    logTestResult('Admin Login', false, error.message);
  }

  // Test Get Current User (with user token)
  if (userToken) {
    try {
      const endpoint = '/auth/me';
      log('\nTesting Get Current User...', 'bright');
      logRequest('GET', endpoint);

      const response = await makeRequest('GET', endpoint, null, {
        'Authorization': `Bearer ${userToken}`
      });
      logResponse(response.status, response.statusText, response.data);

      const passed = response.status === 200 &&
                     response.data?.data?.id &&
                     response.data?.data?.email === TEST_USERS.user.email;

      logTestResult('Get Current User', passed);
    } catch (error) {
      logTestResult('Get Current User', false, error.message);
    }
  }

  return { userToken, adminToken };
}

async function testCategories(userToken) {
  logSubHeader('Categories Tests');

  try {
    const endpoint = '/categories';
    log('\nTesting Get All Categories...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   Array.isArray(response.data?.data) &&
                   response.data.data.length > 0;

    const categoryCount = response.data?.data?.length || 0;
    const incomeCount = response.data?.data?.filter(c => c.type === 'INCOME').length || 0;
    const expenseCount = response.data?.data?.filter(c => c.type === 'EXPENSE').length || 0;

    logTestResult('Get All Categories', passed,
      `Total: ${categoryCount} (Income: ${incomeCount}, Expense: ${expenseCount})`);

    if (passed && response.data.data.length > 0) {
      log(`Sample categories:`, 'dim');
      response.data.data.slice(0, 3).forEach(cat => {
        log(`  - ${cat.icon} ${cat.name} (${cat.type})`, 'dim');
      });
    }

    return response.data?.data || [];
  } catch (error) {
    logTestResult('Get All Categories', false, error.message);
    return [];
  }
}

async function testTransactions(userToken) {
  logSubHeader('Transactions Tests');

  // Get All Transactions
  try {
    const endpoint = '/transactions';
    log('\nTesting Get All Transactions...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data;

    const transactionCount = response.data?.data?.data?.length || 0;
    const incomeCount = response.data?.data?.data?.filter(t => t.type === 'INCOME').length || 0;
    const expenseCount = response.data?.data?.data?.filter(t => t.type === 'EXPENSE').length || 0;

    logTestResult('Get All Transactions', passed,
      `Total: ${transactionCount} (Income: ${incomeCount}, Expense: ${expenseCount})`);

    if (passed && response.data.data.data?.length > 0) {
      log(`Sample transactions:`, 'dim');
      response.data.data.data.slice(0, 3).forEach(tx => {
        log(`  - ${tx.type} ${tx.amount} - ${tx.description}`, 'dim');
      });
    }
  } catch (error) {
    logTestResult('Get All Transactions', false, error.message);
  }

  // Get Transaction Statistics
  try {
    const endpoint = '/transactions/statistics';
    log('\nTesting Get Transaction Statistics...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.totalIncome !== undefined &&
                   response.data?.data?.totalExpenses !== undefined;

    if (passed) {
      const stats = response.data.data;
      logTestResult('Get Transaction Statistics', passed,
        `Income: ${stats.totalIncome}, Expenses: ${stats.totalExpenses}, Net: ${stats.net}`);
    } else {
      logTestResult('Get Transaction Statistics', false);
    }
  } catch (error) {
    logTestResult('Get Transaction Statistics', false, error.message);
  }
}

async function testBudgets(userToken) {
  logSubHeader('Budgets Tests');

  try {
    const endpoint = '/budgets';
    log('\nTesting Get All Budgets...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data;

    const budgetCount = response.data?.data?.data?.length || 0;
    const monthlyCount = response.data?.data?.data?.filter(b => b.period === 'MONTHLY').length || 0;
    const yearlyCount = response.data?.data?.data?.filter(b => b.period === 'YEARLY').length || 0;

    logTestResult('Get All Budgets', passed,
      `Total: ${budgetCount} (Monthly: ${monthlyCount}, Yearly: ${yearlyCount})`);

    if (passed && response.data.data.data?.length > 0) {
      log(`Sample budgets:`, 'dim');
      response.data.data.data.slice(0, 3).forEach(budget => {
        log(`  - ${budget.category?.name}: ${budget.amount} (${budget.period})`, 'dim');
      });
    }
  } catch (error) {
    logTestResult('Get All Budgets', false, error.message);
  }
}

async function testDashboard(userToken) {
  logSubHeader('Dashboard Tests');

  try {
    const endpoint = '/dashboard';
    log('\nTesting Get Dashboard...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.totalIncome !== undefined &&
                   response.data?.data?.totalExpenses !== undefined &&
                   response.data?.data?.netIncome !== undefined;

    if (passed) {
      const dashboard = response.data.data;
      logTestResult('Get Dashboard', passed);
      log(`Dashboard Stats:`, 'dim');
      log(`  - Total Income: ${dashboard.totalIncome}`, 'dim');
      log(`  - Total Expenses: ${dashboard.totalExpenses}`, 'dim');
      log(`  - Net Income: ${dashboard.netIncome}`, 'dim');
      log(`  - Accounts Balance: ${dashboard.accountsBalance}`, 'dim');
      if (dashboard.recentTransactions) {
        log(`  - Recent Transactions: ${dashboard.recentTransactions.length}`, 'dim');
      }
      if (dashboard.monthlyTrend) {
        log(`  - Monthly Trend Data: ${dashboard.monthlyTrend.length} months`, 'dim');
      }
    } else {
      logTestResult('Get Dashboard', false);
    }
  } catch (error) {
    logTestResult('Get Dashboard', false, error.message);
  }
}

async function testUserProfile(userToken, userName) {
  logSubHeader('User Profile Tests');

  try {
    const endpoint = '/users/profile';
    log('\nTesting Get User Profile...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${userToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   response.data?.data?.id &&
                   response.data?.data?.email;

    if (passed) {
      const profile = response.data.data;
      logTestResult('Get User Profile', passed,
        `${profile.firstName} ${profile.lastName} (${profile.role})`);
    } else {
      logTestResult('Get User Profile', false);
    }
  } catch (error) {
    logTestResult('Get User Profile', false, error.message);
  }
}

async function testAdminEndpoints(adminToken) {
  logSubHeader('Admin-Only Endpoints Tests');

  // Get All Users
  try {
    const endpoint = '/users';
    log('\nTesting Get All Users (Admin only)...', 'bright');
    logRequest('GET', endpoint);

    const response = await makeRequest('GET', endpoint, null, {
      'Authorization': `Bearer ${adminToken}`
    });
    logResponse(response.status, response.statusText, response.data);

    const passed = response.status === 200 &&
                   Array.isArray(response.data?.data) &&
                   response.data.data.length > 0;

    const userCount = response.data?.data?.length || 0;
    logTestResult('Get All Users (Admin)', passed, `Total users: ${userCount}`);

    if (passed && response.data.data.length > 0) {
      log(`Sample users:`, 'dim');
      response.data.data.slice(0, 3).forEach(user => {
        log(`  - ${user.email} (${user.role})`, 'dim');
      });
    }
  } catch (error) {
    logTestResult('Get All Users (Admin)', false, error.message);
  }

  // Verify authorization on regular user
  try {
    const endpoint = '/users';
    log('\nTesting Get All Users (Regular user - should fail)...', 'bright');

    // Get a user token (from previous tests)
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: TEST_USERS.user.email,
      password: TEST_USERS.user.password
    });

    const userToken = loginResponse.data?.data?.accessToken;

    if (userToken) {
      logRequest('GET', endpoint);

      const response = await makeRequest('GET', endpoint, null, {
        'Authorization': `Bearer ${userToken}`
      });
      logResponse(response.status, response.statusText, response.data);

      const passed = response.status === 403; // Should be forbidden for regular user
      logTestResult('Authorization Check (Regular user)', passed,
        'Regular user correctly denied access to admin endpoint');
    }
  } catch (error) {
    logTestResult('Authorization Check (Regular user)', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  logHeader('FINANCE APP API ENDPOINT TESTS');
  log(`Testing API at: ${API_BASE_URL}`, 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'dim');

  // Test health check first
  const healthOk = await testHealthCheck();

  if (!healthOk) {
    log('\nERROR: API server is not responding. Please ensure the backend is running.', 'red');
    log(`Run: npm run backend:dev`, 'yellow');
    process.exit(1);
  }

  // Test authentication
  const { userToken, adminToken } = await testAuthentication();

  if (!userToken) {
    log('\nERROR: User authentication failed. Cannot proceed with further tests.', 'red');
    process.exit(1);
  }

  // Run all tests with authenticated user
  await testCategories(userToken);
  await testTransactions(userToken);
  await testBudgets(userToken);
  await testDashboard(userToken);
  await testUserProfile(userToken, TEST_USERS.user.name);

  // Run admin tests if admin token is available
  if (adminToken) {
    await testAdminEndpoints(adminToken);
  } else {
    log('\nWARNING: Admin authentication failed. Skipping admin-only tests.', 'yellow');
  }

  // Print summary
  printTestSummary();
}

function printTestSummary() {
  logHeader('TEST SUMMARY');

  log(`\nTotal Tests: ${testResults.passed + testResults.failed}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');

  const passPercentage = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2);
  log(`Pass Rate: ${passPercentage}%`, testResults.failed === 0 ? 'green' : 'yellow');

  if (testResults.failed > 0) {
    log('\nFailed Tests:', 'red');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        log(`  ✗ ${t.name}${t.message ? `: ${t.message}` : ''}`, 'red');
      });
  }

  console.log('\n' + '='.repeat(80));

  if (testResults.failed === 0) {
    log('ALL TESTS PASSED!', 'green');
  } else {
    log(`${testResults.failed} TEST(S) FAILED`, 'red');
  }

  console.log('='.repeat(80) + '\n');

  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log(`\nFATAL ERROR: ${error.message}`, 'red');
  process.exit(1);
});
