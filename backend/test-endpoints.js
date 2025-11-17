const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testEndpoints() {
  try {
    console.log('Testing new endpoints...\n');

    // First, try to register a test user
    console.log('0. Setting up test user...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'demo@financeapp.com',
        password: 'Demo1234!',
        firstName: 'Demo',
        lastName: 'User'
      });
      console.log('✓ Test user registered');
    } catch (error) {
      // User might already exist, that's okay
      console.log('✓ Test user already exists');
    }

    // Now, login to get a token
    console.log('\n1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'demo@financeapp.com',
      password: 'Demo1234!'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✓ Login successful');
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    // Test GET /auth/me endpoint
    console.log('2. Testing GET /auth/me endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✓ GET /auth/me successful');
    console.log('User data:', JSON.stringify(meResponse.data.data, null, 2));
    console.log('');

    // Test GET /dashboard endpoint
    console.log('3. Testing GET /dashboard endpoint...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✓ GET /dashboard successful');
    console.log('Dashboard data:');
    console.log(`  Total Income: $${dashboardResponse.data.data.totalIncome}`);
    console.log(`  Total Expenses: $${dashboardResponse.data.data.totalExpenses}`);
    console.log(`  Net Income: $${dashboardResponse.data.data.netIncome}`);
    console.log(`  Accounts Balance: $${dashboardResponse.data.data.accountsBalance}`);
    console.log(`  Recent Transactions: ${dashboardResponse.data.data.recentTransactions.length} transactions`);
    console.log(`  Monthly Trend: ${dashboardResponse.data.data.monthlyTrend.length} months`);
    console.log('\nMonthly Trend:');
    dashboardResponse.data.data.monthlyTrend.forEach(month => {
      console.log(`  ${month.month}: Income $${month.income}, Expenses $${month.expenses}`);
    });

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testEndpoints();
