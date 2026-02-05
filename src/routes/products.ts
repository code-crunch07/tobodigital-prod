import express from 'express';
import productController from '../controllers/products';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

// Get all products
router.get('/', productController.getAllProducts);

// Get single product
router.get('/:id', productController.getProductById);

// Create product
router.post('/', productController.createProduct);

// Update product
router.put('/:id', productController.updateProduct);

// Bulk delete products (must be before /:id route)
router.delete('/bulk', productController.bulkDeleteProducts);

// Duplicate product
router.post('/:id/duplicate', productController.duplicateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

export default router;



