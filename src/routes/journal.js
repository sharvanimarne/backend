import express from 'express';
import {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
  getJournalStats
} from '../controllers/journalController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all journals with optional filters
router.get('/', getJournals);

// Get journal statistics
router.get('/stats', getJournalStats);

// Get single journal by ID
router.get('/:id', getJournalById);

// Create new journal entry
router.post('/', createJournal);

// Update journal entry
router.put('/:id', updateJournal);

// Delete journal entry
router.delete('/:id', deleteJournal);

export default router;