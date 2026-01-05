import { jest } from '@jest/globals';
import { ApiError, asyncHandler, errorHandler } from '../../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  describe('ApiError', () => {
    it('should create ApiError with status code and message', () => {
      const error = new ApiError(404, 'Not found');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
    });

    it('should default to 500 if no status code provided', () => {
      const error = new ApiError(null, 'Server error');
      
      expect(error.statusCode).toBe(500);
    });
  });

  describe('asyncHandler', () => {
    it('should call next with error if async function throws', async () => {
      const mockError = new Error('Test error');
      const mockFn = jest.fn(() => Promise.reject(mockError));
      const wrapped = asyncHandler(mockFn);
      
      const req = {};
      const res = {};
      const next = jest.fn();

      await wrapped(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should not call next if async function succeeds', async () => {
      const mockFn = jest.fn(() => Promise.resolve());
      const wrapped = asyncHandler(mockFn);
      
      const req = {};
      const res = { json: jest.fn() };
      const next = jest.fn();

      await wrapped(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('should handle ApiError correctly', () => {
      const error = new ApiError(404, 'Resource not found');
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resource not found',
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = new Error('Generic error');
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should use error status if available', () => {
      const error = new Error('Bad request');
      error.status = 400;
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad request',
      });
    });

    it('should show detailed error in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Dev error');
      error.stack = 'Error stack trace';
      
      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Dev error',
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
