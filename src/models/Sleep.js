import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  }
}, {
  timestamps: true
});

sleepSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Sleep', sleepSchema);