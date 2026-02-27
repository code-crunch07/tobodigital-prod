import express from 'express';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  listUsers,
  updateUser,
  changePassword,
  authenticateToken,
  requireAdmin,
} from '../controllers/auth';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected: current user
router.get('/me', getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

// Admin only: list and update users
router.get('/users', requireAdmin, listUsers);
router.patch('/users/:id', requireAdmin, updateUser);

export default router;

