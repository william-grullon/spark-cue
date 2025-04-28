import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { POST } from '../../../app/api/messages/update-status/route';

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

describe('Messages Update Status API', () => {
  const mockMessage = {
    id: 1,
    profile_id: 1,
    source: 'test',
    persona: 'friend',
    message: 'Hello, this is a test message',
    created_at: '2025-04-28T00:00:00.000Z',
    sent_at: null,
    responded_at: null,
    response_latency: null,
    success: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update message status to sent', async () => {
    // Mock request with sent action
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: 1, action: 'sent' }),
    } as unknown as NextRequest;

    // Mock db implementation
    const mockPrepare = db.prepare as jest.Mock;
    
    // First prepare call is for the SELECT to check if message exists
    const selectStmt = {
      get: jest.fn().mockReturnValue(mockMessage)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);
    
    // Second prepare call is for the UPDATE
    const updateStmt = {
      run: jest.fn().mockReturnValue({ changes: 1 })
    };
    mockPrepare.mockReturnValueOnce(updateStmt);
    
    // Third prepare call is for the SELECT to get updated message
    const updatedMessage = {
      ...mockMessage,
      sent_at: '2025-04-28T00:01:00.000Z',
    };
    const selectUpdatedStmt = {
      get: jest.fn().mockReturnValue(updatedMessage)
    };
    mockPrepare.mockReturnValueOnce(selectUpdatedStmt);

    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenNthCalledWith(1, 'SELECT * FROM messages WHERE id = ?');
    expect(selectStmt.get).toHaveBeenCalledWith(1);
    expect(db.prepare).toHaveBeenNthCalledWith(2, 'UPDATE messages SET sent_at = CURRENT_TIMESTAMP WHERE id = ?');
    expect(updateStmt.run).toHaveBeenCalledWith(1);
    expect(db.prepare).toHaveBeenNthCalledWith(3, 'SELECT * FROM messages WHERE id = ?');
    expect(selectUpdatedStmt.get).toHaveBeenCalledWith(1);
    expect(NextResponse.json).toHaveBeenCalledWith(updatedMessage);
  });

  it('should update message status to responded', async () => {
    // Mock request with responded action
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: 1, action: 'responded' }),
    } as unknown as NextRequest;

    // Mock db implementation
    const mockPrepare = db.prepare as jest.Mock;
    
    // First prepare call is for the SELECT to check if message exists
    const selectStmt = {
      get: jest.fn().mockReturnValue(mockMessage)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);
    
    // Second prepare call is for the UPDATE
    const updateStmt = {
      run: jest.fn().mockReturnValue({ changes: 1 })
    };
    mockPrepare.mockReturnValueOnce(updateStmt);
    
    // Third prepare call is for the SELECT to get updated message
    const updatedMessage = {
      ...mockMessage,
      responded_at: '2025-04-28T00:02:00.000Z',
      response_latency: 120,
      success: 1,
    };
    const selectUpdatedStmt = {
      get: jest.fn().mockReturnValue(updatedMessage)
    };
    mockPrepare.mockReturnValueOnce(selectUpdatedStmt);

    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenNthCalledWith(1, 'SELECT * FROM messages WHERE id = ?');
    expect(selectStmt.get).toHaveBeenCalledWith(1);
    
    // Updated expectation to match the actual implementation's SQL format
    const expectedUpdateQuery = `UPDATE messages
       SET responded_at = CURRENT_TIMESTAMP,
           response_latency = (strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', created_at)),
           success = 1
       WHERE id = ?`;
    expect(db.prepare).toHaveBeenNthCalledWith(2, expectedUpdateQuery);
    
    expect(updateStmt.run).toHaveBeenCalledWith(1);
    expect(db.prepare).toHaveBeenNthCalledWith(3, 'SELECT * FROM messages WHERE id = ?');
    expect(selectUpdatedStmt.get).toHaveBeenCalledWith(1);
    expect(NextResponse.json).toHaveBeenCalledWith(updatedMessage);
  });

  it('should return 404 if message not found', async () => {
    // Mock request
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: 999, action: 'sent' }),
    } as unknown as NextRequest;

    // Mock db implementation to return null (message not found)
    const mockPrepare = db.prepare as jest.Mock;
    const selectStmt = {
      get: jest.fn().mockReturnValue(null)
    };
    mockPrepare.mockReturnValueOnce(selectStmt);

    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM messages WHERE id = ?');
    expect(selectStmt.get).toHaveBeenCalledWith(999);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Message not found' },
      { status: 404 }
    );
  });

  it('should return 400 for invalid input', async () => {
    // Mock request with invalid data (missing required field 'action')
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: 1 }),
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

  it('should return 400 for invalid action', async () => {
    // Mock request with invalid action
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ id: 1, action: 'invalid' }),
    } as unknown as NextRequest;

    // This test is actually not needed since the zod schema validation would catch this
    // But we'll keep it and change our expectations to match how zod would handle it
    
    // Call the API function
    await POST(mockRequest);

    // Assertions
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid input' },
      { status: 400 }
    );
    expect(db.prepare).not.toHaveBeenCalled();
  });
});