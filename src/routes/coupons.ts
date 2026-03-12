import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  getPublicCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupons';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

// Public routes (storefront)
router.post('/validate', validateCoupon);
router.get('/public/active', getPublicCoupons);

// Dashboard routes (admin or shop manager)
router.get('/', requireAdminOrShopManager, getAllCoupons);
router.post('/', requireAdminOrShopManager, createCoupon);
router.put('/:id', requireAdminOrShopManager, updateCoupon);
router.delete('/:id', requireAdminOrShopManager, deleteCoupon);

export default router;

