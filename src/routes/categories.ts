import express from 'express';
import categoryController from '../controllers/categories';

const router = express.Router();

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Create category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;



