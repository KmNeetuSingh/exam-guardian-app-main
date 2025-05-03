import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';  // Import cors
import path from 'path'; // Import path
import { fileURLToPath } from 'url'; // Import fileURLToPath
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exam.js';
import sessionRoutes from './routes/session.js';
import userRoutes from './routes/user.js'; // Import user routes

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all routes and origins globally
app.use(cors());  // This enables CORS globally

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB connection
connectDB();

app.get('/', (req, res) => {
  res.send('Exam Guardian Backend API');
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes); // Mount user routes

// Serve static files (profile pictures)
// Ensure the 'uploads' directory exists in your backend root
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
