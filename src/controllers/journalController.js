// src/controllers/journalController.js
import Journal from '../models/Journal.js';

export const getJournals = async (req, res) => {
  try {
    const { startDate, endDate, minMood, maxMood, limit } = req.query;
    
    let query = { userId: req.userId };
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Mood filter
    if (minMood) query.mood = { ...query.mood, $gte: parseInt(minMood) };
    if (maxMood) query.mood = { ...query.mood, $lte: parseInt(maxMood) };

    let journalQuery = Journal.find(query).sort({ date: -1 });
    
    if (limit) {
      journalQuery = journalQuery.limit(parseInt(limit));
    }

    const journals = await journalQuery;
    
    res.json({
      success: true,
      count: journals.length,
      data: journals
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!journal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Journal entry not found' 
      });
    }

    res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createJournal = async (req, res) => {
  try {
    const { mood, text, date } = req.body;

    if (!mood || !text) {
      return res.status(400).json({
        success: false,
        message: 'Mood and text are required'
      });
    }

    const journal = new Journal({
      userId: req.userId,
      mood,
      text,
      date: date || new Date()
    });

    await journal.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journal
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateJournal = async (req, res) => {
  try {
    const { mood, text, date } = req.body;

    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { mood, text, date },
      { new: true, runValidators: true }
    );

    if (!journal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Journal entry not found' 
      });
    }

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: journal
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!journal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Journal entry not found' 
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getJournalStats = async (req, res) => {
  try {
    const stats = await Journal.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          averageMood: { $avg: '$mood' },
          highestMood: { $max: '$mood' },
          lowestMood: { $min: '$mood' }
        }
      }
    ]);

    // Mood distribution
    const moodDistribution = await Journal.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalEntries: 0,
          averageMood: 0,
          highestMood: 0,
          lowestMood: 0
        },
        moodDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};