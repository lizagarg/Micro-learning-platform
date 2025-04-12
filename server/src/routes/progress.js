import express from 'express';
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/progress/:userId
// @desc    Get all progress for a user
// @access  Protected
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    // Ensure the requesting user can only access their own progress
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized to access this progress data' });
    }
    
    const progress = await Progress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error while fetching progress' });
  }
});

// @route   GET /api/progress/:userId/:lessonId
// @desc    Get progress for a specific lesson for a user
// @access  Protected
router.get('/:userId/:lessonId', verifyToken, async (req, res) => {
  try {
    // Ensure the requesting user can only access their own progress
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized to access this progress data' });
    }
    
    const progress = await Progress.findOne({
      userId: req.params.userId,
      lessonId: req.params.lessonId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching progress' });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress
// @access  Protected
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, lessonId, completed, currentStep, percentComplete, answers } = req.body;
    
    console.log('Request user ID:', req.user._id);
    console.log('Request body userId:', userId);
    
    // Ensure the requesting user can only update their own progress
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this progress data' });
    }
    
    // Try to find existing progress
    let progress = await Progress.findOne({ userId, lessonId });
    
    const now = new Date();
    console.log('Progress update initiated at:', now);
    
    if (progress) {
      console.log('Existing progress found:', {
        userId,
        lessonId,
        currentStreak: progress.currentStreak,
        lastStreakUpdate: progress.lastStreakUpdate
      });
      
      // Update existing progress
      progress.completed = completed !== undefined ? completed : progress.completed;
      progress.currentStep = currentStep !== undefined ? currentStep : progress.currentStep;
      progress.percentComplete = percentComplete !== undefined ? percentComplete : progress.percentComplete;
      
      // If answers is provided, update them
      if (answers) {
        // Convert answers object to Map entries
        Object.entries(answers).forEach(([questionId, answer]) => {
          progress.answers.set(questionId, answer);
        });
      }
      
      // Update lastAccessed to trigger streak calculation in pre-save hook
      progress.lastAccessed = now;
      
      await progress.save();
      console.log('Progress updated - new streak value:', progress.currentStreak);
    } else {
      // Create new progress
      const newProgress = new Progress({
        userId,
        lessonId,
        completed: completed || false,
        currentStep: currentStep || 0,
        percentComplete: percentComplete || 0,
        lastAccessed: now,
        accessDates: [now],
        currentStreak: 1,
        lastStreakUpdate: now
      });
      
      // If answers is provided, add them
      if (answers) {
        // Convert answers object to Map entries
        Object.entries(answers).forEach(([questionId, answer]) => {
          newProgress.answers.set(questionId, answer);
        });
      }
      
      progress = await newProgress.save();
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error while updating progress' });
  }
});

export default router; 