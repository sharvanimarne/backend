import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  history: [{
    type: Date
  }]
}, {
  timestamps: true
});

habitSchema.index({ userId: 1 });

export default mongoose.model('Habit', habitSchema);