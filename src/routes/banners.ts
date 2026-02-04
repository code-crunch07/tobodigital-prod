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

const router = express.Router();

// Public route - Get active banners
router.get('/public', getActiveBanners);
// Public route - Get active promotion banners
router.get('/public/promotion', getActivePromotionBanners);

// Admin routes
router.get('/', getAllBanners);
router.get('/:id', getBannerById);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

export default router;
