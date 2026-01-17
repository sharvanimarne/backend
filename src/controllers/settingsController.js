import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Finance from '../models/Finance.js';
import Journal from '../models/Journal.js';
import Habit from '../models/Habit.js';
import Subscription from '../models/Subscription.js';
import Wellness from '../models/Wellness.js';
import Gratitude from '../models/Gratitude.js';
import Hydration from '../models/Hydration.js';
import Sleep from '../models/Sleep.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      // Create default settings
      settings = await Settings.createDefaultSettings(req.userId);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const allowedUpdates = [
      'theme',
      'notifications',
      'sound',
      'language',
      'timezone',
      'dateFormat',
      'currency',
      'darkMode',
      'emailNotifications',
      'pushNotifications',
      'weeklyDigest',
      'dataBackup',
      'privacyMode'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new Settings({
        userId: req.userId,
        ...updates
      });
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const resetSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      settings = await Settings.createDefaultSettings(req.userId);
    } else {
      // Reset to defaults
      settings.theme = 'dracula';
      settings.notifications = true;
      settings.sound = false;
      settings.language = 'en';
      settings.timezone = 'UTC';
      settings.dateFormat = 'MM/DD/YYYY';
      settings.currency = 'USD';
      settings.darkMode = true;
      settings.emailNotifications = true;
      settings.pushNotifications = false;
      settings.weeklyDigest = true;
      settings.dataBackup = true;
      settings.privacyMode = false;

      await settings.save();
    }

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: settings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const settings = await Settings.findOne({ userId: req.userId });
    const finances = await Finance.find({ userId: req.userId });
    const journals = await Journal.find({ userId: req.userId });
    const habits = await Habit.find({ userId: req.userId });
    const subscriptions = await Subscription.find({ userId: req.userId });
    const wellness = await Wellness.findOne({ userId: req.userId });
    const gratitude = await Gratitude.findOne({ userId: req.userId });
    const hydration = await Hydration.find({ userId: req.userId });
    const sleep = await Sleep.find({ userId: req.userId });

    const exportData = {
      exportDate: new Date(),
      user,
      settings,
      finances,
      journals,
      habits,
      subscriptions,
      wellness,
      gratitude,
      hydration,
      sleep
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteUserData = async (req, res) => {
  try {
    const { confirmEmail } = req.body;

    const user = await User.findById(req.userId);

    if (confirmEmail !== user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email confirmation does not match'
      });
    }

    // Delete all user data
    await Promise.all([
      Finance.deleteMany({ userId: req.userId }),
      Journal.deleteMany({ userId: req.userId }),
      Habit.deleteMany({ userId: req.userId }),
      Subscription.deleteMany({ userId: req.userId }),
      Wellness.deleteMany({ userId: req.userId }),
      Gratitude.deleteMany({ userId: req.userId }),
      Hydration.deleteMany({ userId: req.userId }),
      Sleep.deleteMany({ userId: req.userId }),
      Settings.deleteMany({ userId: req.userId }),
      User.findByIdAndDelete(req.userId)
    ]);

    res.json({
      success: true,
      message: 'All user data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

