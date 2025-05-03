import express from 'express';
import Exam from '../models/Exam.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Create exam (proctor only)
router.post('/', authenticate, authorizeRoles('proctor'), async (req, res) => {
  try {
    const { title, description, date, duration } = req.body;
    const exam = new Exam({
      title,
      description,
      date,
      duration,
      createdBy: req.user.userId,
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all exams (all users)
router.get('/', authenticate, async (req, res) => {
  try {
    const exams = await Exam.find().populate('createdBy', 'name email');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get exam by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 