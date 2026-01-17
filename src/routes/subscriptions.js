import express from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all subscriptions
router.get('/', getSubscriptions);

// Get single subscription by ID
router.get('/:id', getSubscriptionById);

// Create new subscription
router.post('/', createSubscription);

// Update subscription
router.put('/:id', updateSubscription);

// Delete subscription
router.delete('/:id', deleteSubscription);

export default router;