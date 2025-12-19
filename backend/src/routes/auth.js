import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Verify token endpoint
router.post('/verify', verifyToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

// Get user profile
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

export default router;
