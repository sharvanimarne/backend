
import Habit from '../models/Habit.js';

export const getHabits = async (req, res) => {
  try {
    const { frequency, active } = req.query;
    
    let query = { userId: req.userId };
    
    if (frequency) {
      query.frequency = frequency;
    }
    const habits = await Habit.find(query).sort({ createdAt: -1 });
    
    // Filter active habits if requested
    let filteredHabits = habits;
    if (active === 'true') {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      filteredHabits = habits.filter(habit => {
        if (!habit.lastCompletedDate) return false;
        return new Date(habit.lastCompletedDate) >= threeDaysAgo;
      });
    }

    res.json({
      success: true,
      count: filteredHabits.length,
      data: filteredHabits
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    res.json({
      success: true,
      data: habit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Habit name is required'
      });
    }

    const habit = new Habit({
      userId: req.userId,
      name,
      frequency: frequency || 'daily',
      streak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      history: []
    });

    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: habit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, frequency },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    res.json({
      success: true,
      message: 'Habit updated successfully',
      data: habit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = habit.lastCompletedDate 
      ? new Date(habit.lastCompletedDate) 
      : null;
    
    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
    }

    // Check if already completed today
    if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
      return res.json({
        success: true,
        message: 'Habit already completed today',
        data: habit
      });
    }

    // Check if consecutive day
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isConsecutive = lastCompleted && 
      lastCompleted.getTime() === yesterday.getTime();

    // Update streak
    habit.streak = isConsecutive ? habit.streak + 1 : 1;
    habit.longestStreak = Math.max(habit.longestStreak, habit.streak);
    habit.lastCompletedDate = new Date();
    habit.history.push(new Date());

    await habit.save();

    res.json({
      success: true,
      message: 'Habit marked as complete',
      data: habit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      return res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
    }

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });

    const stats = {
      totalHabits: habits.length,
      activeHabits: 0,
      totalStreak: 0,
      averageStreak: 0,
      longestStreakOverall: 0,
      completionRate: 0
    };

    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

    habits.forEach(habit => {
      if (habit.lastCompletedDate && new Date(habit.lastCompletedDate) >= threeDaysAgo) {
        stats.activeHabits++;
      }
      stats.totalStreak += habit.streak;
      stats.longestStreakOverall = Math.max(stats.longestStreakOverall, habit.longestStreak);
    });

    if (habits.length > 0) {
      stats.averageStreak = Math.round(stats.totalStreak / habits.length);
      
      // Calculate completion rate (last 7 days)
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      let totalPossibleCompletions = 0;
      let actualCompletions = 0;

      habits.forEach(habit => {
        totalPossibleCompletions += 7; // 7 days
        const recentCompletions = habit.history.filter(date => 
          new Date(date) >= sevenDaysAgo
        );
        actualCompletions += recentCompletions.length;
      });

      stats.completionRate = totalPossibleCompletions > 0
        ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
        : 0;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};