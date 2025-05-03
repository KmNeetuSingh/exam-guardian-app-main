import express from 'express';
import ExamSession from '../models/ExamSession.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Student starts an exam session
router.post('/start', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const { examId } = req.body;
    const session = new ExamSession({
      exam: examId,
      student: req.user.userId,
      status: 'active',
      startTime: new Date(),
      idVerified: false,
    });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Proctor updates session status (e.g., flag, complete)
router.patch('/:id/status', authenticate, authorizeRoles('proctor'), async (req, res) => {
  try {
    const { status } = req.body;
    const session = await ExamSession.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get sessions (students see their own, proctors see all)
router.get('/', authenticate, async (req, res) => {
  try {
    let sessions;
    if (req.user.role === 'student') {
      sessions = await ExamSession.find({ student: req.user.userId })
        .populate('exam')
        .populate('proctor', 'name email');
    } else if (req.user.role === 'proctor') {
      sessions = await ExamSession.find()
        .populate('exam')
        .populate('student', 'name email');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 