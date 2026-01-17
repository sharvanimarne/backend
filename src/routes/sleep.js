/ src/routes/sleep.js
import express from 'express';
import Sleep from '../models/Sleep.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get latest sleep record
router.get('/latest', async (req, res) => {
  try {
    const sleep = await Sleep.findOne({ userId: req.userId })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: sleep
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Get sleep history
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    let query = { userId: req.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let sleepQuery = Sleep.find(query).sort({ date: -1 });

    if (limit) {
      sleepQuery = sleepQuery.limit(parseInt(limit));
    }

    const history = await sleepQuery;

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

// Create sleep record
router.post('/', async (req, res) => {
  try {
    const { hours, date } = req.body;

    if (!hours || typeof hours !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Hours must be provided as a number'
      });
    }

    const sleep = new Sleep({
      userId: req.userId,
      hours,
      date: date || new Date()
    });

    await sleep.save();

    res.status(201).json({
      success: true,
      message: 'Sleep record created successfully',
      data: sleep
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update sleep record
router.put('/:id', async (req, res) => {
  try {
    const { hours, date } = req.body;

    const sleep = await Sleep.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { hours, date },
      { new: true, runValidators: true }
    );

    if (!sleep) {
      return res.status(404).json({
        success: false,
        message: 'Sleep record not found'
      });
    }

    res.json({
      success: true,
      message: 'Sleep record updated successfully',
      data: sleep
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete sleep record
router.delete('/:id', async (req, res) => {
  try {
    const sleep = await Sleep.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!sleep) {
      return res.status(404).json({
        success: false,
        message: 'Sleep record not found'
      });
    }

    res.json({
      success: true,
      message: 'Sleep record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get sleep statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Sleep.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          averageHours: { $avg: '$hours' },
          maxHours: { $max: '$hours' },
          minHours: { $min: '$hours' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalRecords: 0,
        averageHours: 0,
        maxHours: 0,
        minHours: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;