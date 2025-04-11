import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sampleLessons } from './sampleData.js';
import Lesson from '../models/Lesson.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:Disha2012@cluster0.fjrmf.mongodb.net/microlearning')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed the database with sample lessons
const seedDatabase = async () => {
  try {
    // Clear existing lessons (optional)
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');

    // Insert sample lessons
    const createdLessons = await Lesson.insertMany(sampleLessons);
    console.log(`Seeded ${createdLessons.length} lessons successfully`);

    // Log the created lesson IDs for reference
    createdLessons.forEach(lesson => {
      console.log(`Lesson: ${lesson.title} (ID: ${lesson._id})`);
    });

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 