import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { POST } from '../../../app/api/messages/add/route';

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

describe('Messages Add API', () => {
  const mockMessage = {
    profile_id: 1,
    source: 'test',
    persona: 'friend',
    message: 'Hello, this is a test message',
  };

  const mockMessageResponse = {
    id: 1,
    ...mockMessage,
    created_at: '2025-04-28T00:00:00.000Z',
    sent_at: null,
    responded_at: null,
    response_latency: null,
    success: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a message successfully', async () => {
    // Mock request
    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockMessage),
    } as unknown as NextRequest;

    // Mock db implementation
    const mockPrepare = db.prepare as jest.Mock;
    
    // First prepare call is for the INSERT
    const mockRunResult = { lastInsertRowid: 1 };
    const insertStmt = {
      run: jest.fn().mockReturnValue(mockRunResult)
    };
    mockPrepare.mockReturnValueOnce(insertStmt);
    
    // Second prepare call is for the SELECT
    const selectStmt = {
      get: jest.fn().mockReturnValue(mockMessageResponse)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenNthCalledWith(1, 
      `INSERT INTO messages (profile_id, source, persona, message) VALUES (?, ?, ?, ?)`
    );
    expect(insertStmt.run).toHaveBeenCalledWith(
      mockMessage.profile_id,
      mockMessage.source,
      mockMessage.persona,
      mockMessage.message
    );
    expect(db.prepare).toHaveBeenNthCalledWith(2, 'SELECT * FROM messages WHERE id = ?');
    expect(selectStmt.get).toHaveBeenCalledWith(1);
    expect(NextResponse.json).toHaveBeenCalledWith(mockMessageResponse, { status: 201 });
  });

  it('should return 400 for invalid input', async () => {
    // Mock request with invalid data (missing required field 'message')
    const mockInvalidMessage = {
      profile_id: 1,
      source: 'test',
      persona: 'friend',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockInvalidMessage),
    } as unknown as NextRequest;

    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid input' },
      { status: 400 }
    );
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should handle database errors and return 500', async () => {
    // Temporarily silence console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    try {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockMessage),
      } as unknown as NextRequest;

      // Mock db implementation to throw an error
      const mockPrepare = db.prepare as jest.Mock;
      const insertStmt = {
        run: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      };
      mockPrepare.mockReturnValueOnce(insertStmt);

      // Call the API function
      await POST(mockRequest);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
      expect(console.error).toHaveBeenCalled();
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  });
});