import { Router } from 'express';
import {
  submitReview,
  getApprovedReviews,
  getProductReviews,
  getAllReviews,
  approveReview,
  deleteReview,
} from '../controllers/reviews';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = Router();

// Public routes
router.post('/', submitReview);
router.get('/', getApprovedReviews);
router.get('/product/:productId', getProductReviews);

// Dashboard/admin routes (protected)
router.get('/admin/all', requireAdminOrShopManager, getAllReviews);
router.patch('/admin/:id/approve', requireAdminOrShopManager, approveReview);
router.delete('/admin/:id', requireAdminOrShopManager, deleteReview);

export default router;
