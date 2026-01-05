import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { mockUser, createAuthHeader } from '../setup.js';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
};

// Mock Firebase Admin
jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifyIdToken: jest.fn((token) => {
        if (token === 'valid-token') {
          return Promise.resolve({
            uid: mockUser.uid,
            email: mockUser.email,
            name: mockUser.name,
            email_verified: mockUser.emailVerified,
          });
        }
        return Promise.reject(new Error('Invalid token'));
      }),
    }),
  },
}));

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/verify', () => {
    it('should verify valid token and return user data', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.uid).toBe(mockUser.uid);
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', createAuthHeader('invalid-token'));

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 when token is malformed', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
