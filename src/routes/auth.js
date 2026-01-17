import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  changePassword,
  updateTheme,
  updateSettings
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.put('/theme', authenticate, updateTheme);
router.put('/settings', authenticate, updateSettings);

export default router;