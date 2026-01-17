import Wellness from '../models/Wellness.js';

export const getWellnessConfig = async (req, res) => {
  try {
    let wellness = await Wellness.findOne({ userId: req.userId });

    if (!wellness) {
      // Create default wellness config
      wellness = new Wellness({
        userId: req.userId,
        config: [
          "Take Vitamins",
          "10m Stretch",
          "Sun Exposure",
          "No Sugar",
          "Read 10 pages"
        ],
        dailyStates: new Map()
      });
      await wellness.save();
    }

    res.json({
      success: true,
      data: wellness.config
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateWellnessConfig = async (req, res) => {
  try {
    const { config } = req.body;

    if (!Array.isArray(config)) {
      return res.status(400).json({
        success: false,
        message: 'Config must be an array'
      });
    }

    let wellness = await Wellness.findOne({ userId: req.userId });

    if (!wellness) {
      wellness = new Wellness({
        userId: req.userId,
        config,
        dailyStates: new Map()
      });
    } else {
      wellness.config = config;
    }

    await wellness.save();

    res.json({
      success: true,
      message: 'Wellness config updated successfully',
      data: wellness.config
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getWellnessState = async (req, res) => {
  try {
    const { date } = req.params;

    const wellness = await Wellness.findOne({ userId: req.userId });

    if (!wellness || !wellness.dailyStates) {
      return res.json({
        success: true,
        data: {}
      });
    }

    const state = wellness.dailyStates.get(date);
    const stateObject = state ? Object.fromEntries(state) : {};

    res.json({
      success: true,
      data: stateObject
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateWellnessState = async (req, res) => {
  try {
    const { date } = req.params;
    const { state } = req.body;

    if (typeof state !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'State must be an object'
      });
    }

    let wellness = await Wellness.findOne({ userId: req.userId });

    if (!wellness) {
      wellness = new Wellness({
        userId: req.userId,
        config: [],
        dailyStates: new Map()
      });
    }

    if (!wellness.dailyStates) {
      wellness.dailyStates = new Map();
    }

    wellness.dailyStates.set(date, new Map(Object.entries(state)));
    await wellness.save();

    res.json({
      success: true,
      message: 'Wellness state updated successfully',
      data: state
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getWellnessHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const wellness = await Wellness.findOne({ userId: req.userId });

    if (!wellness || !wellness.dailyStates) {
      return res.json({
        success: true,
        data: []
      });
    }

    let history = Array.from(wellness.dailyStates.entries()).map(([date, state]) => ({
      date,
      state: Object.fromEntries(state),
      completed: Object.values(Object.fromEntries(state)).filter(Boolean).length,
      total: Object.keys(Object.fromEntries(state)).length
    }));

    // Filter by date range if provided
    if (startDate || endDate) {
      history = history.filter(entry => {
        const entryDate = new Date(entry.date);
        if (startDate && entryDate < new Date(startDate)) return false;
        if (endDate && entryDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};