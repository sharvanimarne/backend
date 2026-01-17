// src/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    default: 'dracula',
    enum: ['dracula', 'aura', 'memento', 'tokyo']
  },
  notifications: {
    type: Boolean,
    default: true
  },
  sound: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'hi']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY']
  },
  darkMode: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: false
  },
  weeklyDigest: {
    type: Boolean,
    default: true
  },
  dataBackup: {
    type: Boolean,
    default: true
  },
  privacyMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create default settings when user is created
settingsSchema.statics.createDefaultSettings = async function(userId) {
  try {
    const settings = new this({ userId });
    await settings.save();
    return settings;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model('Settings', settingsSchema);