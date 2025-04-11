import express from 'express';
import Lesson from '../models/Lesson.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/lessons
// @desc    Get all lessons
// @access  Protected
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get all lessons, but only return basic info (not full content)
    const lessons = await Lesson.find().select('title description createdAt updatedAt');
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Server error while fetching lessons' });
  }
});

// @route   GET /api/lessons/:id
// @desc    Get a specific lesson with full content
// @access  Protected
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching lesson' });
  }
});

// @route   POST /api/lessons
// @desc    Create a new lesson
// @access  Protected (would typically be admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, content } = req.body;
    
    const newLesson = new Lesson({
      title,
      description,
      content
    });
    
    const savedLesson = await newLesson.save();
    res.status(201).json(savedLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Server error while creating lesson' });
  }
});

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Protected (would typically be admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, content } = req.body;
    
    // Find lesson and update
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        content,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedLesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.status(500).json({ message: 'Server error while updating lesson' });
  }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Protected (would typically be admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    await lesson.remove();
    res.json({ message: 'Lesson removed' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.status(500).json({ message: 'Server error while deleting lesson' });
  }
});

export default router; 