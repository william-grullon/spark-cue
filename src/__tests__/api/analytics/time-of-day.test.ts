import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { GET } from '../../../app/api/analytics/time-of-day/route';

// Mock the NextRequest/NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// Mock the database
jest.mock('../../../../lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
  }),
}));

describe('Analytics Time-of-Day API', () => {
  const mockAnalyticsData = [
    { hour: 0, count: 2, success: 1, success_rate: 0.5 },
    { hour: 8, count: 5, success: 3, success_rate: 0.6 },
    { hour: 12, count: 10, success: 8, success_rate: 0.8 },
    { hour: 17, count: 8, success: 5, success_rate: 0.63 },
    { hour: 21, count: 6, success: 4, success_rate: 0.67 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return analytics data for time of day', async () => {
    // Mock db implementation
    const mockPrepare = db.prepare as jest.Mock;
    const selectStmt = {
      all: jest.fn().mockReturnValue(mockAnalyticsData)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Mock request with a valid URL
    const mockRequest = {
      url: 'http://localhost:3000/api/analytics/time-of-day'
    } as unknown as NextRequest;

    // Call the API function
    await GET(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT strftime'));
    expect(selectStmt.all).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(mockAnalyticsData);
  });

  it('should handle empty results', async () => {
    // Mock db implementation to return empty array
    const mockPrepare = db.prepare as jest.Mock;
    const selectStmt = {
      all: jest.fn().mockReturnValue([])
    };
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Mock request with a valid URL
    const mockRequest = {
      url: 'http://localhost:3000/api/analytics/time-of-day'
    } as unknown as NextRequest;

    // Call the API function
    await GET(mockRequest);

    // Assertions
    expect(selectStmt.all).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith([]);
  });

  it('should handle database errors', async () => {
    // Mock db implementation to throw an error
    const mockPrepare = db.prepare as jest.Mock;
    mockPrepare.mockImplementation(() => {
      throw new Error('Database error');
    });

    // Mock request with a valid URL
    const mockRequest = {
      url: 'http://localhost:3000/api/analytics/time-of-day'
    } as unknown as NextRequest;

    try {
      // Call the API function
      await GET(mockRequest);
      
      // This test might fail if your API has try/catch handling
      // If it does, adjust this expectation accordingly
      fail('Should have thrown an error');
    } catch (error) {
      // Check that an error was thrown
      expect(error).toBeDefined();
    }
  });

  it('should filter by profile_id when provided', async () => {
    // Mock db implementation
    const mockPrepare = db.prepare as jest.Mock;
    const selectStmt = {
      all: jest.fn().mockReturnValue(mockAnalyticsData)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Mock request with profile_id parameter
    const mockRequest = {
      url: 'http://localhost:3000/api/analytics/time-of-day?profile_id=1'
    } as unknown as NextRequest;

    // Call the API function
    await GET(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE profile_id = ?'));
    expect(selectStmt.all).toHaveBeenCalledWith(1);
    expect(NextResponse.json).toHaveBeenCalledWith(mockAnalyticsData);
  });
});