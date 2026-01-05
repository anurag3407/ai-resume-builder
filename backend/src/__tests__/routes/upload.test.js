import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from '../../routes/upload.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { mockUser, createAuthHeader } from '../setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/upload', uploadRoutes);
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

describe('Upload Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('resume', Buffer.from('test'), 'test.pdf');

      expect(response.status).toBe(401);
    });

    it('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', createAuthHeader('valid-token'))
        .attach('resume', Buffer.from('test'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Only PDF files/i);
    });

    it('should reject files larger than 5MB', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', createAuthHeader('valid-token'))
        .attach('resume', largeBuffer, 'large.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/File too large|exceeds/i);
    });
  });

  describe('POST /api/upload/extract-text', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload/extract-text')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/upload/extract-text')
        .attach('resume', Buffer.from('test'), 'test.pdf');

      expect(response.status).toBe(401);
    });

    it('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/api/upload/extract-text')
        .set('Authorization', createAuthHeader('valid-token'))
        .attach('resume', Buffer.from('test'), 'test.doc');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Only PDF files/i);
    });
  });
});
