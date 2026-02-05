import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupons';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

// Public route - Validate coupon (storefront)
router.post('/validate', validateCoupon);

// Dashboard routes (admin or shop manager)
router.get('/', requireAdminOrShopManager, getAllCoupons);
router.post('/', requireAdminOrShopManager, createCoupon);
router.put('/:id', requireAdminOrShopManager, updateCoupon);
router.delete('/:id', requireAdminOrShopManager, deleteCoupon);

export default router;

