// src/routes/settings.js
import express from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  exportUserData,
  deleteUserData
} from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user settings
router.get('/', getSettings);

// Update user settings
router.put('/', updateSettings);

// Reset settings to default
router.post('/reset', resetSettings);

// Export all user data (GDPR compliance)
router.get('/export', exportUserData);

// Delete all user data (GDPR compliance - right to be forgotten)
router.delete('/data', deleteUserData);

export default router;