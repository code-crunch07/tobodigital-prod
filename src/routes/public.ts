import { Router } from 'express';
import { getPublicProducts, getPublicProductById, getPublicCategories, getPublicCategoryBySlug, getPublicSubCategories } from '../controllers/public';
import { getActiveBanners, getActivePromotionBanners, getActivePromoRowBanners, getActiveBannersByCategory } from '../controllers/banners';
import { getActiveNavigations } from '../controllers/navigation';

const router = Router();

// Public product routes
router.get('/products', getPublicProducts);
router.get('/products/:id', getPublicProductById);

// Public category routes
router.get('/categories', getPublicCategories);
router.get('/categories/slug/:slug', getPublicCategoryBySlug);
router.get('/subcategories', getPublicSubCategories);
router.get('/subcategories/category/:categoryId', getPublicSubCategories);

// Public banner routes
router.get('/banners', getActiveBanners);
router.get('/banners/promotion', getActivePromotionBanners);
router.get('/banners/promo-row', getActivePromoRowBanners);
router.get('/banners/category/:slug', getActiveBannersByCategory);

// Public navigation routes
router.get('/navigations', getActiveNavigations);

export default router;
