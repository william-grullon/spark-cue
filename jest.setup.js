// This file is used to set up the testing environment for Jest
require('@testing-library/jest-dom');

// Mock the database to prevent actual database operations during tests
jest.mock('@/lib/db', () => {
  const mockDb = {
    prepare: jest.fn().mockReturnThis(),
    run: jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 }),
    get: jest.fn(),
    all: jest.fn(),
  };
  return mockDb;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});