import express from 'express';
import { enhanceResume, generateSummary, suggestImprovements } from '../config/langchain.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// Enhance resume with AI
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { resumeText, preferences } = req.body;

  if (!resumeText || !resumeText.trim()) {
    throw new ApiError(400, 'Resume text is required');
  }

  if (!preferences || !preferences.jobRole) {
    throw new ApiError(400, 'Job role preference is required');
  }

  // Validate preferences
  const validatedPreferences = {
    jobRole: preferences.jobRole,
    yearsOfExperience: preferences.yearsOfExperience || 0,
    skills: Array.isArray(preferences.skills) ? preferences.skills : [],
    industry: preferences.industry || '',
    customInstructions: preferences.customInstructions || ''
  };

  try {
    const result = await enhanceResume(resumeText, validatedPreferences);
    
    res.json({
      success: true,
      data: {
        enhancedResume: result.enhancedResume,
        tokensUsed: result.tokensUsed,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Resume enhancement error:', error);
    throw new ApiError(500, 'Failed to enhance resume. Please try again.');
  }
}));

// Generate summary only
router.post('/summary', verifyToken, asyncHandler(async (req, res) => {
  const { resumeText, jobRole } = req.body;

  if (!resumeText || !resumeText.trim()) {
    throw new ApiError(400, 'Resume text is required');
  }

  if (!jobRole) {
    throw new ApiError(400, 'Job role is required');
  }

  try {
    const result = await generateSummary(resumeText, jobRole);
    
    res.json({
      success: true,
      data: {
        summary: result.summary
      }
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    throw new ApiError(500, 'Failed to generate summary. Please try again.');
  }
}));

// Get improvement suggestions
router.post('/suggestions', verifyToken, asyncHandler(async (req, res) => {
  const { resumeText, jobRole } = req.body;

  if (!resumeText || !resumeText.trim()) {
    throw new ApiError(400, 'Resume text is required');
  }

  if (!jobRole) {
    throw new ApiError(400, 'Job role is required');
  }

  try {
    const result = await suggestImprovements(resumeText, jobRole);
    
    res.json({
      success: true,
      data: {
        suggestions: result.suggestions
      }
    });
  } catch (error) {
    console.error('Suggestions generation error:', error);
    throw new ApiError(500, 'Failed to generate suggestions. Please try again.');
  }
}));

export default router;
