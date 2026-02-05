import express from 'express';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
  getActivePromotionBanners,
} from '../controllers/banners';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

// Public route - Get active banners
router.get('/public', getActiveBanners);
// Public route - Get active promotion banners
router.get('/public/promotion', getActivePromotionBanners);

// Dashboard routes (admin or shop manager)
router.get('/', requireAdminOrShopManager, getAllBanners);
router.get('/:id', requireAdminOrShopManager, getBannerById);
router.post('/', requireAdminOrShopManager, createBanner);
router.put('/:id', requireAdminOrShopManager, updateBanner);
router.delete('/:id', requireAdminOrShopManager, deleteBanner);

export default router;
