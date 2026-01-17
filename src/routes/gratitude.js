// src/routes/gratitude.js
import express from 'express';
import Gratitude from '../models/Gratitude.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get gratitude items
router.get('/', async (req, res) => {
  try {
    let gratitude = await Gratitude.findOne({ userId: req.userId });

    if (!gratitude) {
      gratitude = new Gratitude({
        userId: req.userId,
        items: ["My Health", "Coffee in the morning", "Coding"]
      });
      await gratitude.save();
    }

    res.json({
      success: true,
      data: gratitude.items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update gratitude items
router.put('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    let gratitude = await Gratitude.findOne({ userId: req.userId });

    if (!gratitude) {
      gratitude = new Gratitude({
        userId: req.userId,
        items
      });
    } else {
      gratitude.items = items;
    }

    await gratitude.save();

    res.json({
      success: true,
      message: 'Gratitude items updated successfully',
      data: gratitude.items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;