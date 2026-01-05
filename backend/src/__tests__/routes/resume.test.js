import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import resumeRoutes from '../../routes/resume.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { mockUser, createAuthHeader } from '../setup.js';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/resumes', resumeRoutes);
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

describe('Resume Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/resumes', () => {
    it('should return empty array when user has no resumes', async () => {
      const response = await request(app)
        .get('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumes).toBeDefined();
      expect(Array.isArray(response.body.data.resumes)).toBe(true);
      expect(response.body.data.count).toBe(0);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get('/api/resumes');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/resumes', () => {
    it('should create a new resume with valid data', async () => {
      const resumeData = {
        originalText: 'John Doe\nSoftware Engineer\n...',
        enhancedText: 'JOHN DOE\nSenior Software Engineer\n...',
        jobRole: 'Software Engineer',
        title: 'My Resume',
        preferences: {
          yearsOfExperience: 5,
          skills: ['JavaScript', 'React', 'Node.js'],
        },
      };

      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send(resumeData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe(resumeData.title);
      expect(response.body.data.jobRole).toBe(resumeData.jobRole);
      expect(response.body.data.originalText).toBe(resumeData.originalText);
    });

    it('should return 400 when originalText is missing', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ title: 'Test Resume' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should create resume with minimal data', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ originalText: 'Minimal resume content' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalText).toBe('Minimal resume content');
      expect(response.body.data.title).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({ originalText: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/resumes/:resumeId', () => {
    let createdResumeId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ originalText: 'Test resume for retrieval' });
      
      createdResumeId = response.body.data.id;
    });

    it('should get a specific resume by ID', async () => {
      const response = await request(app)
        .get(`/api/resumes/${createdResumeId}`)
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.originalText).toBe('Test resume for retrieval');
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .get('/api/resumes/non-existent-id-123')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).get(`/api/resumes/${createdResumeId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/resumes/:resumeId', () => {
    let createdResumeId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ 
          originalText: 'Original text',
          title: 'Original Title' 
        });
      
      createdResumeId = response.body.data.id;
    });

    it('should update a resume', async () => {
      const updates = {
        title: 'Updated Title',
        enhancedText: 'Enhanced resume text',
        jobRole: 'Senior Engineer',
      };

      const response = await request(app)
        .put(`/api/resumes/${createdResumeId}`)
        .set('Authorization', createAuthHeader('valid-token'))
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.enhancedText).toBe(updates.enhancedText);
      expect(response.body.data.jobRole).toBe(updates.jobRole);
      expect(response.body.data.lastModified).toBeDefined();
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .put('/api/resumes/non-existent-id')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put(`/api/resumes/${createdResumeId}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/resumes/:resumeId', () => {
    it('should delete a resume', async () => {
      // Create a resume to delete
      const createResponse = await request(app)
        .post('/api/resumes')
        .set('Authorization', createAuthHeader('valid-token'))
        .send({ originalText: 'To be deleted' });

      const resumeId = createResponse.body.data.id;

      // Delete the resume
      const deleteResponse = await request(app)
        .delete(`/api/resumes/${resumeId}`)
        .set('Authorization', createAuthHeader('valid-token'));

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBeDefined();

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/resumes/${resumeId}`)
        .set('Authorization', createAuthHeader('valid-token'));

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent resume', async () => {
      const response = await request(app)
        .delete('/api/resumes/non-existent-id')
        .set('Authorization', createAuthHeader('valid-token'));

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app).delete('/api/resumes/some-id');

      expect(response.status).toBe(401);
    });
  });
});
