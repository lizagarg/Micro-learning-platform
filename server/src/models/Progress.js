import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  currentStep: {
    type: Number,
    default: 0
  },
  percentComplete: {
    type: Number,
    default: 0
  },
  answers: {
    type: Map,
    of: {
      selected: String,
      correct: Boolean
    },
    default: {}
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Update completedAt when lesson is completed
progressSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

// Create a compound index to ensure a user can have only one progress entry per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress; 