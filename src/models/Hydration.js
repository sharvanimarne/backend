import mongoose from 'mongoose';

const hydrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  cups: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

hydrationSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Hydration', hydrationSchema);