import mongoose from 'mongoose';

const gratitudeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model('Gratitude', gratitudeSchema);