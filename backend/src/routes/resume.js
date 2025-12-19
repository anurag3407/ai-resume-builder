import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// In-memory storage for development (replace with Firebase Firestore in production)
const resumeStore = new Map();

// Get all resumes for a user
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;
  
  // Get resumes from store (in production, this would be Firebase Firestore)
  const userResumes = [];
  for (const [id, resume] of resumeStore) {
    if (resume.userId === userId) {
      userResumes.push({ id, ...resume });
    }
  }

  // Sort by creation date (newest first)
  userResumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    data: {
      resumes: userResumes,
      count: userResumes.length
    }
  });
}));

// Get a specific resume
router.get('/:resumeId', verifyToken, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.uid;

  const resume = resumeStore.get(resumeId);

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  if (resume.userId !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({
    success: true,
    data: resume
  });
}));

// Create a new resume
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;
  const { 
    originalText, 
    enhancedText, 
    jobRole, 
    preferences,
    title 
  } = req.body;

  if (!originalText) {
    throw new ApiError(400, 'Original text is required');
  }

  const resumeId = uuidv4();
  const now = new Date().toISOString();

  const newResume = {
    userId,
    originalText,
    enhancedText: enhancedText || null,
    jobRole: jobRole || null,
    preferences: preferences || {},
    title: title || `Resume - ${new Date().toLocaleDateString()}`,
    pdfUrl: null,
    createdAt: now,
    lastModified: now
  };

  resumeStore.set(resumeId, newResume);

  res.status(201).json({
    success: true,
    data: {
      id: resumeId,
      ...newResume
    }
  });
}));

// Update a resume
router.put('/:resumeId', verifyToken, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.uid;
  const updates = req.body;

  const resume = resumeStore.get(resumeId);

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  if (resume.userId !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  // Fields that can be updated
  const allowedUpdates = [
    'originalText', 
    'enhancedText', 
    'jobRole', 
    'preferences', 
    'title', 
    'pdfUrl'
  ];

  const updateData = {};
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  updateData.lastModified = new Date().toISOString();

  const updatedResume = {
    ...resume,
    ...updateData
  };

  resumeStore.set(resumeId, updatedResume);

  res.json({
    success: true,
    data: {
      id: resumeId,
      ...updatedResume
    }
  });
}));

// Delete a resume
router.delete('/:resumeId', verifyToken, asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.uid;

  const resume = resumeStore.get(resumeId);

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  if (resume.userId !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  resumeStore.delete(resumeId);

  res.json({
    success: true,
    message: 'Resume deleted successfully'
  });
}));

export default router;
