import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { GET, PUT, DELETE } from '../../../app/api/profiles/[id]/route';

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

describe('Profile by ID API', () => {
  const mockProfile = {
    id: 1,
    name: 'Test User',
    bio: 'Test bio',
    location: 'Test location',
    pictures: JSON.stringify(['https://example.com/image.jpg']),
    avatar_url: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profiles/[id]', () => {
    it('should return a profile by id', async () => {
      // Mock db implementation for this test
      const mockPrepare = db.prepare as jest.Mock;
      const selectStmt = {
        get: jest.fn().mockReturnValue(mockProfile)
      };
      mockPrepare.mockReturnValueOnce(selectStmt);

      // Mock request
      const mockRequest = {} as NextRequest;
      const mockParams = { params: { id: '1' } };

      // Call the API function
      await GET(mockRequest, mockParams);

      // Assertions
      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM profiles WHERE id = ?');
      expect(selectStmt.get).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        ...mockProfile,
        pictures: JSON.parse(mockProfile.pictures)
      });
    });

    it('should return 404 if profile not found', async () => {
      // Mock db implementation for this test
      const mockPrepare = db.prepare as jest.Mock;
      const selectStmt = {
        get: jest.fn().mockReturnValue(null)
      };
      mockPrepare.mockReturnValueOnce(selectStmt);

      // Mock request
      const mockRequest = {} as NextRequest;
      const mockParams = { params: { id: '999' } };

      // Call the API function
      await GET(mockRequest, mockParams);

      // Assertions
      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM profiles WHERE id = ?');
      expect(selectStmt.get).toHaveBeenCalledWith(999);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Profile not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid id', async () => {
      // Mock request with invalid id
      const mockRequest = {} as NextRequest;
      const mockParams = { params: { id: 'invalid' } };

      // Call the API function
      await GET(mockRequest, mockParams);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid id format' },
        { status: 400 }
      );
      expect(db.prepare).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/profiles/[id]', () => {
    it('should update a profile successfully', async () => {
      const updatedProfile = {
        name: 'Updated User',
        bio: 'Updated bio',
        location: 'Updated location',
        pictures: [{ description: 'https://example.com/updated.jpg' }],
        avatar_url: 'https://example.com/updated-avatar.jpg',
      };

      // Mock request with valid data
      const mockRequest = {
        json: jest.fn().mockResolvedValue(updatedProfile),
      } as unknown as NextRequest;
      const mockParams = { params: { id: '1' } };

      // Mock db implementation for this test
      const mockPrepare = db.prepare as jest.Mock;

      // First prepare call is for the UPDATE
      const updateStmt = {
        run: jest.fn().mockReturnValue({ changes: 1 })
      };
      mockPrepare.mockReturnValueOnce(updateStmt);

      // Second prepare call is for the SELECT to get updated profile
      const updatedDbProfile = {
        id: 1,
        ...updatedProfile,
        pictures: JSON.stringify(updatedProfile.pictures)
      };
      const selectStmt = {
        get: jest.fn().mockReturnValue(updatedDbProfile)
      };
      mockPrepare.mockReturnValueOnce(selectStmt);

      // Call the API function
      await PUT(mockRequest, mockParams);

      // Assertions
      expect(db.prepare).toHaveBeenNthCalledWith(1,
        `UPDATE profiles SET name=?, bio=?, location=?, pictures=?, avatar_url=? WHERE id=?`
      );
      expect(updateStmt.run).toHaveBeenCalledWith(
        updatedProfile.name,
        updatedProfile.bio || null,
        updatedProfile.location || null,
        JSON.stringify(updatedProfile.pictures),
        updatedProfile.avatar_url || null,
        1
      );
      expect(db.prepare).toHaveBeenNthCalledWith(2, 'SELECT * FROM profiles WHERE id = ?');
      expect(selectStmt.get).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith({
        id: 1,
        ...updatedProfile,
        pictures: updatedProfile.pictures
      });
    });

    it('should return 400 for invalid input', async () => {
      // Mock request with invalid data
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ bio: 'Missing required fields' }),
      } as unknown as NextRequest;
      const mockParams = { params: { id: '1' } };

      // Call the API function
      await PUT(mockRequest, mockParams);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid input' },
        { status: 400 }
      );
      expect(db.prepare).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/profiles/[id]', () => {
    it('should delete a profile successfully', async () => {
      // Mock request
      const mockRequest = {} as NextRequest;
      const mockParams = { params: { id: '1' } };

      // Mock db implementation
      const mockPrepare = db.prepare as jest.Mock;
      const deleteStmt = {
        run: jest.fn().mockReturnValue({ changes: 1 })
      };
      mockPrepare.mockReturnValueOnce(deleteStmt);

      // Call the API function
      await DELETE(mockRequest, mockParams);

      // Assertions
      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM profiles WHERE id = ?');
      expect(deleteStmt.run).toHaveBeenCalledWith(1);
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return success false if no rows affected', async () => {
      // Mock request
      const mockRequest = {} as NextRequest;
      const mockParams = { params: { id: '999' } };

      // Mock db implementation
      const mockPrepare = db.prepare as jest.Mock;
      const deleteStmt = {
        run: jest.fn().mockReturnValue({ changes: 0 })
      };
      mockPrepare.mockReturnValueOnce(deleteStmt);

      // Call the API function
      await DELETE(mockRequest, mockParams);

      // Assertions
      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM profiles WHERE id = ?');
      expect(deleteStmt.run).toHaveBeenCalledWith(999);
      expect(NextResponse.json).toHaveBeenCalledWith({ success: false });
    });
  });
});