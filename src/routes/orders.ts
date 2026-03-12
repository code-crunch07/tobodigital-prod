import express from 'express';
import orderController from '../controllers/orders';
import { optionalAuth, requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

// Razorpay (must be before /:id)
router.post('/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.post('/notify-payment-failed', orderController.notifyPaymentFailed);

// Get all orders (optionalAuth: customer sees own, admin/shop_manager see all)
router.get('/', optionalAuth, orderController.getAllOrders);

// Get order tracking info (must be before /:id to avoid conflict)
router.get('/:id/tracking', optionalAuth, orderController.getOrderTracking);

// Get single order (optionalAuth: customer only own, admin/shop_manager any)
router.get('/:id', optionalAuth, orderController.getOrderById);

// Create order (storefront)
router.post('/', orderController.createOrder);

// Update/delete order (admin or shop manager only)
router.put('/:id', requireAdminOrShopManager, orderController.updateOrder);
router.delete('/:id', requireAdminOrShopManager, orderController.deleteOrder);

export default router;



