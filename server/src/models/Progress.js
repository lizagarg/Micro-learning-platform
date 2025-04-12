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
  },
  // New fields for streak tracking
  accessDates: {
    type: [Date],
    default: []
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastStreakUpdate: {
    type: Date,
    default: null
  }
});

// Update completedAt when lesson is completed
progressSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  // Update streak data when lastAccessed is modified
  if (this.isModified('lastAccessed')) {
    console.log('lastAccessed modified in pre-save hook');
    
    // Create a proper today date object with time set to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('Today (normalized):', today);
    
    // For testing purposes: uncomment the following line to simulate 
    // accessing on a different day than the previous access
    // today.setDate(today.getDate() + 1); // Simulate tomorrow
    
    // Get last streak update date and strip time component
    // If lastStreakUpdate is null, this is the first time
    let lastStreakUpdateDate = null;
    if (this.lastStreakUpdate) {
      lastStreakUpdateDate = new Date(this.lastStreakUpdate);
      lastStreakUpdateDate.setHours(0, 0, 0, 0);
      console.log('Last streak update date (normalized):', lastStreakUpdateDate);
    } else {
      console.log('No previous streak update date found - first time accessing');
    }
    
    // Simple test - compare date strings to ensure we're handling dates correctly
    const todayStr = today.toDateString();
    const lastUpdateStr = lastStreakUpdateDate ? lastStreakUpdateDate.toDateString() : null;
    console.log(`Comparing dates: today (${todayStr}) vs last update (${lastUpdateStr})`);
    
    const isNewDay = !lastUpdateStr || todayStr !== lastUpdateStr;
    console.log('Is this a new day?', isNewDay);
    
    // Only update streak if it's a different day
    if (isNewDay) {
      console.log('Updating streak - it is a new day or first access');
      
      // Check if today is already in access dates
      const accessDateExists = this.accessDates.some(date => 
        new Date(date).toDateString() === todayStr
      );
      
      console.log('Access date exists for today:', accessDateExists);
      
      if (!accessDateExists) {
        console.log('Adding today to access dates');
        this.accessDates.push(today);
        
        // If last update exists, check if it was yesterday
        if (lastStreakUpdateDate) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          console.log(`Yesterday was: ${yesterdayStr}, last update was: ${lastUpdateStr}`);
          console.log('Checking if last update was yesterday:', yesterdayStr === lastUpdateStr);
          
          if (yesterdayStr === lastUpdateStr) {
            // Consecutive day, increment streak
            this.currentStreak += 1;
            console.log('Streak incremented - consecutive day:', this.currentStreak);
          } else {
            // Not consecutive, reset streak to 1
            this.currentStreak = 1;
            console.log('Streak reset to 1 - not consecutive');
          }
        } else {
          // First access, set streak to 1
          this.currentStreak = 1;
          console.log('First access - streak set to 1');
        }
        
        // Update lastStreakUpdate to today
        this.lastStreakUpdate = today;
        console.log('lastStreakUpdate set to today:', today);
      } else {
        console.log('Not updating streak - already accessed today');
      }
    } else {
      console.log('Not updating streak - same day as last update');
    }
  }
  
  next();
});

// Create a compound index to ensure a user can have only one progress entry per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress; 