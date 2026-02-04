import express from 'express';
import subCategoryController from '../controllers/subcategories';

const router = express.Router();

// Get all subcategories
router.get('/', subCategoryController.getAllSubCategories);

// Get subcategories by category
router.get('/category/:categoryId', subCategoryController.getSubCategoriesByCategory);

// Get single subcategory
router.get('/:id', subCategoryController.getSubCategoryById);

// Create subcategory
router.post('/', subCategoryController.createSubCategory);

// Update subcategory
router.put('/:id', subCategoryController.updateSubCategory);

// Delete subcategory
router.delete('/:id', subCategoryController.deleteSubCategory);

export default router;



