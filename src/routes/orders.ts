import express from 'express';
import orderController from '../controllers/orders';
import { optionalAuth, requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

// Razorpay (must be before /:id)
router.post('/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/verify-payment', orderController.verifyPayment);

// Get all orders (optionalAuth: customer sees own, admin/shop_manager see all)
router.get('/', optionalAuth, orderController.getAllOrders);

// Get single order (optionalAuth: customer only own, admin/shop_manager any)
router.get('/:id', optionalAuth, orderController.getOrderById);

// Create order (storefront)
router.post('/', orderController.createOrder);

// Update/delete order (admin or shop manager only)
router.put('/:id', requireAdminOrShopManager, orderController.updateOrder);
router.delete('/:id', requireAdminOrShopManager, orderController.deleteOrder);

export default router;



