// src/routes/wellness.js
import express from 'express';
import {
  getWellnessConfig,
  updateWellnessConfig,
  getWellnessState,
  updateWellnessState,
  getWellnessHistory
} from '../controllers/wellnessController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get wellness checklist configuration
router.get('/config', getWellnessConfig);

// Update wellness checklist configuration
router.put('/config', updateWellnessConfig);

// Get wellness state for a specific date
router.get('/state/:date', getWellnessState);

// Update wellness state for a specific date
router.put('/state/:date', updateWellnessState);

// Get wellness history
router.get('/history', getWellnessHistory);

export default router;