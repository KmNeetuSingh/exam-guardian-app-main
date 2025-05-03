import mongoose from 'mongoose';

const examSessionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date },
  endTime: { type: Date },
  status: { type: String, enum: ['pending', 'active', 'completed', 'flagged'], default: 'pending' },
  idVerified: { type: Boolean, default: false },
}, { timestamps: true });

const ExamSession = mongoose.model('ExamSession', examSessionSchema);
export default ExamSession; 