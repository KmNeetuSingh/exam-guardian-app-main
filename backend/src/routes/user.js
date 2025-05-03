import express from 'express';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pics/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Use user ID to ensure unique filenames
    const uniqueSuffix = req.user.userId + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // Limit file size (e.g., 2MB)
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
});

// Route to upload profile picture
// Uses 'authenticate' middleware to ensure user is logged in
// Uses multer middleware 'upload.single('profilePic')' to handle single file upload with field name 'profilePic'
router.post('/profile-picture', authenticate, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Construct the file path relative to the server root (adjust if needed)
    const filePath = `/uploads/profile-pics/${req.file.filename}`;

    // Find user and update profile picture path
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.profilePicture = filePath; // Add or update the profilePicture field
    await user.save();

    // Return the updated user info, including the new profile picture path
    res.json({
      message: 'Profile picture uploaded successfully.',
      filePath: filePath,
      user: { // Return relevant user info
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture
      }
    });

  } catch (err) {
    console.error("Profile picture upload error:", err);
    // Handle specific Multer errors if needed
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err.message.startsWith('Error: File upload only supports')) {
         return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during upload.', error: err.message });
  }
});

// Route to get user profile (including profile picture path)
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ message: 'Server error fetching profile.', error: err.message });
    }
});


export default router; 