import express from 'express';
import {
  getAllNavigations,
  getNavigationById,
  createNavigation,
  updateNavigation,
  deleteNavigation,
} from '../controllers/navigation';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

router.get('/', getAllNavigations);
router.get('/:id', getNavigationById);
router.post('/', createNavigation);
router.put('/:id', updateNavigation);
router.delete('/:id', deleteNavigation);

export default router;
