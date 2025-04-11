import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
}, { _id: false }); // Prevent Mongoose from auto-generating ObjectId

const contentItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'image'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  videoUrl: {
    type: String,
    required: function() {
      return this.type === 'video';
    }
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.type === 'image';
    }
  },
  description: {
    type: String
  },
  questions: [questionSchema]
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: [contentItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
lessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson; 