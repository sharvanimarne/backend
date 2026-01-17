// src/routes/habits.js
import express from 'express';
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  toggleHabit,
  deleteHabit,
  getHabitStats
} from '../controllers/habitController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all habits with optional filters
router.get('/', getHabits);

// Get habit statistics
router.get('/stats', getHabitStats);

// Get single habit by ID
router.get('/:id', getHabitById);

// Create new habit
router.post('/', createHabit);

// Toggle habit completion (mark as done for today)
router.post('/:id/toggle', toggleHabit);

// Update habit
router.put('/:id', updateHabit);

// Delete habit
router.delete('/:id', deleteHabit);

export default router;