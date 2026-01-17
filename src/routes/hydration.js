import express from 'express';
import Hydration from '../models/Hydration.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get today's hydration
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hydration = await Hydration.findOne({
      userId: req.userId,
      date: today
    });

    if (!hydration) {
      hydration = new Hydration({
        userId: req.userId,
        date: today,
        cups: 0
      });
      await hydration.save();
    }

    res.json({
      success: true,
      data: hydration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update today's hydration
router.put('/today', async (req, res) => {
  try {
    const { cups } = req.body;

    if (typeof cups !== 'number' || cups < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cups must be a non-negative number'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hydration = await Hydration.findOneAndUpdate(
      { userId: req.userId, date: today },
      { cups },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Hydration updated successfully',
      data: hydration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get hydration history
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = { userId: req.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let historyQuery = Hydration.find(query).sort({ date: -1 });

    if (limit) {
      historyQuery = historyQuery.limit(parseInt(limit));
    }

    const history = await historyQuery;

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
