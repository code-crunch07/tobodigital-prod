import express from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotificationAPI,
} from '../controllers/notifications';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

// Get all notifications
router.get('/', getNotifications);

// Get notification by ID
router.get('/:id', getNotificationById);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification
router.post('/', createNotificationAPI);

export default router;

