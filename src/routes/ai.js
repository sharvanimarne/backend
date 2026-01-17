// src/routes/ai.js
import express from 'express';
import { generateAIInsights } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate AI insights based on user data
router.post('/insights', generateAIInsights);

export default router;