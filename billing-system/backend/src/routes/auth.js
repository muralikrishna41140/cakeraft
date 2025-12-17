import express from 'express';
import { login, getProfile, changePassword, verifyToken } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);
router.get('/verify', protect, verifyToken);

export default router;