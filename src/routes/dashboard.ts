import express from 'express';
import dashboardController from '../controllers/dashboard';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/analytics/customers', dashboardController.getAnalyticsCustomers);
router.get('/analytics/sales', dashboardController.getAnalyticsSales);
router.get('/analytics/orders', dashboardController.getAnalyticsOrders);
router.get('/analytics/products', dashboardController.getAnalyticsProducts);

export default router;



