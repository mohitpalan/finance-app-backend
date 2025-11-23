// E2E test setup file
// This file runs before all E2E tests

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-e2e-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-e2e-refresh-secret-key';
process.env.PORT = '3333'; // Use different port for e2e tests
process.env.DATABASE_URL = 'file:./test-e2e.db';

// Increase test timeout for E2E tests
jest.setTimeout(60000);

// Setup function to run before all tests
beforeAll(async () => {
  // Clean up any existing test database
  const dbPath = path.join(__dirname, '..', 'prisma', 'test-e2e.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Run migrations to create test database
  try {
    execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test-e2e.db',
      },
    });

    // Seed test database
    execSync('npx ts-node prisma/seed.ts', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test-e2e.db',
      },
    });
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Cleanup function to run after all tests
afterAll(async () => {
  // Clean up test database
  const dbPath = path.join(__dirname, '..', 'prisma', 'test-e2e.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
