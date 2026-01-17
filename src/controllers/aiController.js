// src/controllers/aiController.js
import Finance from '../models/Finance.js';
import Journal from '../models/Journal.js';
import Habit from '../models/Habit.js';
import { generateInsights } from '../services/geminiService.js';

export const generateAIInsights = async (req, res) => {
  try {
    // Fetch user data
    const finances = await Finance.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(10);
    
    const journals = await Journal.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(5);
    
    const habits = await Habit.find({ userId: req.userId });

    // Generate insights using Gemini
    const insights = await generateInsights(finances, journals, habits);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate insights'
    });
  }
};