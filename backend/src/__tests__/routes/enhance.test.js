import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import enhanceRoutes from '../../routes/enhance.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { mockUser, createAuthHeader } from '../setup.js';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/enhance', enhanceRoutes);
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

// Mock LangChain functions
jest.unstable_mockModule('../../config/langchain.js', () => ({
  enhanceResume: jest.fn((resumeText, preferences) => {
    return Promise.resolve({
      enhancedResume: `Enhanced version of: ${resumeText.substring(0, 50)}`,
      tokensUsed: {
        prompt: 1000,
        completion: 1500,
        total: 2500,
      },
    });
  }),
  generateSummary: jest.fn((resumeText, jobRole) => {
    return Promise.resolve({
      summary: `Professional ${jobRole} with expertise in various technologies.`,
    });
  }),
  suggestImprovements: jest.fn((resumeText, jobRole) => {
    return Promise.resolve({
      suggestions: [
        'Add more quantifiable achievements',
        'Include relevant keywords for ATS',
        'Highlight leadership experience',
      ],
    });
  }),
}));

describe('Enhance Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/enhance', () => {
    it('should enhance resume with valid data', async () => {
      const requestData = {
        resumeText: 'John Doe\nSoftware Engineer\nExperience: Worked on various projects...',
        preferences: {
          jobRole: 'Senior Software Engineer',
          yearsOfExperience: 5,
          skills: ['JavaScript', 'React', 'Node.js'],
          industry: 'Technology',
          customInstructions: 'Focus on leadership',
        },
      };

      const response = await request(app)
        .post('/api/enhance')
        .set('Authorization', createAuthHeader('valid-token'))
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.enhancedResume).toBeDefined();
      expect(response.body.data.tokensUsed).toBeDefined();
      expect(response.body.data.processedAt).toBeDefined();
    });

    it('should return 400 when resumeText is missing', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          preferences: { jobRole: 'Engineer' },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/resume text/i);
    });

    it('should return 400 when resumeText is empty', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          resumeText: '   ',
          preferences: { jobRole: 'Engineer' },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/resume text/i);
    });

    it('should return 400 when jobRole is missing', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          resumeText: 'Some resume text',
          preferences: {},
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/job role/i);
    });

    it('should use default values for optional preferences', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          resumeText: 'Some resume text',
          preferences: {
            jobRole: 'Engineer',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/enhance')
        .send({
          resumeText: 'Test',
          preferences: { jobRole: 'Engineer' },
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/enhance/summary', () => {
    it('should generate summary with valid data', async () => {
      const response = await request(app)
        .post('/api/enhance/summary')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          resumeText: 'Software engineer with 5 years of experience',
          jobRole: 'Senior Software Engineer',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
    });

    it('should return 400 when resumeText is missing', async () => {
      const response = await request(app)
        .post('/api/enhance/summary')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ jobRole: 'Engineer' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/resume text/i);
    });

    it('should return 400 when jobRole is missing', async () => {
      const response = await request(app)
        .post('/api/enhance/summary')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ resumeText: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/job role/i);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/enhance/summary')
        .send({
          resumeText: 'Test',
          jobRole: 'Engineer',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/enhance/suggestions', () => {
    it('should generate suggestions with valid data', async () => {
      const response = await request(app)
        .post('/api/enhance/suggestions')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({
          resumeText: 'Software engineer with experience',
          jobRole: 'Senior Software Engineer',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });

    it('should return 400 when resumeText is missing', async () => {
      const response = await request(app)
        .post('/api/enhance/suggestions')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ jobRole: 'Engineer' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/resume text/i);
    });

    it('should return 400 when jobRole is missing', async () => {
      const response = await request(app)
        .post('/api/enhance/suggestions')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ resumeText: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/job role/i);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/enhance/suggestions')
        .send({
          resumeText: 'Test',
          jobRole: 'Engineer',
        });

      expect(response.status).toBe(401);
    });
  });
});
