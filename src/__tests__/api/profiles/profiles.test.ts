import { NextRequest, NextResponse } from 'next/server';
import { createMocks } from 'node-mocks-http';
import db from '../../../../lib/db';
import { POST } from '../../../app/api/profiles/route';

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
  }),
}));

describe('Profiles API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a profile successfully', async () => {
    // Mock the request with valid data
    const mockProfile = {
      name: 'Test User',
      bio: 'Test bio',
      location: 'Test location',
      pictures: ['https://example.com/image.jpg'],
      avatar_url: 'https://example.com/avatar.jpg',
    };

    // Mock implementation for request.json()
    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockProfile),
    } as unknown as NextRequest;

    // Mock db implementation for this test
    const mockRunResult = { lastInsertRowid: 1 };
    const mockGet = { 
      id: 1, 
      ...mockProfile, 
      pictures: JSON.stringify(mockProfile.pictures),
      created_at: new Date().toISOString() 
    };
    
    const mockPrepare = db.prepare as jest.Mock;
    const insertStmt = {
      run: jest.fn().mockReturnValue(mockRunResult)
    };
    const selectStmt = {
      get: jest.fn().mockReturnValue(mockGet)
    };
    
    // First call to prepare is for the INSERT
    mockPrepare.mockReturnValueOnce(insertStmt);
    // Second call to prepare is for the SELECT
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Call the API function
    const response = await POST(mockRequest);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      mockGet,
      { status: 201 }
    );
    expect(db.prepare).toHaveBeenNthCalledWith(1, `INSERT INTO profiles (name, bio, location, pictures, avatar_url) VALUES (?, ?, ?, ?, ?)`);
    expect(insertStmt.run).toHaveBeenCalledWith(
      mockProfile.name, 
      mockProfile.bio, 
      mockProfile.location, 
      JSON.stringify(mockProfile.pictures), 
      mockProfile.avatar_url
    );
    expect(db.prepare).toHaveBeenNthCalledWith(2, 'SELECT * FROM profiles WHERE id = ?');
    expect(selectStmt.get).toHaveBeenCalledWith(1);
  });

  it('should return 400 for invalid input', async () => {
    // Mock the request with invalid data (missing required field 'name')
    const mockInvalidProfile = {
      bio: 'Test bio',
      location: 'Test location',
      pictures: ['https://example.com/image.jpg'],
    };

    // Mock implementation for request.json()
    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockInvalidProfile),
    } as unknown as NextRequest;

    // Call the API function
    const response = await POST(mockRequest);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid input' }, 
      { status: 400 }
    );
    expect(db.prepare).not.toHaveBeenCalled();
  });
});