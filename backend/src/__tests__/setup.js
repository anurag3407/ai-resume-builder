// Test setup and utilities
import { jest } from '@jest/globals';

// Mock Firebase Admin SDK
export const mockFirebaseAdmin = {
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
  storage: jest.fn(() => ({
    bucket: jest.fn(),
  })),
};

// Mock user for testing
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
};

// Mock Firebase token
export const mockToken = 'mock-firebase-token-123';

// Helper to create auth header
export const createAuthHeader = (token = mockToken) => {
  return `Bearer ${token}`;
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '9001';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
