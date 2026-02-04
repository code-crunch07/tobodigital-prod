import express from 'express';
import dashboardController from '../controllers/dashboard';

const router = express.Router();

router.get('/stats', dashboardController.getDashboardStats);
router.get('/analytics/customers', dashboardController.getAnalyticsCustomers);
router.get('/analytics/sales', dashboardController.getAnalyticsSales);
router.get('/analytics/orders', dashboardController.getAnalyticsOrders);
router.get('/analytics/products', dashboardController.getAnalyticsProducts);

export default router;



