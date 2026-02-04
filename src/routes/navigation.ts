import express from 'express';
import {
  getAllNavigations,
  getNavigationById,
  createNavigation,
  updateNavigation,
  deleteNavigation,
} from '../controllers/navigation';

const router = express.Router();

// Admin routes
router.get('/', getAllNavigations);
router.get('/:id', getNavigationById);
router.post('/', createNavigation);
router.put('/:id', updateNavigation);
router.delete('/:id', deleteNavigation);

export default router;
