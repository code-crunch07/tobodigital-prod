import express from 'express';
import orderController from '../controllers/orders';
import { optionalAuth } from '../controllers/auth';

const router = express.Router();

// Razorpay (must be before /:id)
router.post('/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/verify-payment', orderController.verifyPayment);

// Get all orders (optionalAuth: when token present, returns only that customer's orders unless admin)
router.get('/', optionalAuth, orderController.getAllOrders);

// Get single order (optionalAuth: customer can only load their own order)
router.get('/:id', optionalAuth, orderController.getOrderById);

// Create order
router.post('/', orderController.createOrder);

// Update order
router.put('/:id', orderController.updateOrder);

// Delete order
router.delete('/:id', orderController.deleteOrder);

export default router;



