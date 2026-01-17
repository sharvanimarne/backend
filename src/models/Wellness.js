import mongoose from 'mongoose';

const wellnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  config: [{
    type: String,
    trim: true
  }],
  dailyStates: {
    type: Map,
    of: {
      type: Map,
      of: Boolean
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Wellness', wellnessSchema);