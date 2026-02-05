import express from 'express';
import customerController from '../controllers/customers';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get single customer
router.get('/:id', customerController.getCustomerById);

// Create customer
router.post('/', customerController.createCustomer);

// Update customer
router.put('/:id', customerController.updateCustomer);

// Update customer theme
router.patch('/:id/theme', customerController.updateTheme);

// Delete customer
router.delete('/:id', customerController.deleteCustomer);

export default router;



