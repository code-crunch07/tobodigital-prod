import express from 'express';
import { requireAdminOrShopManager } from '../controllers/auth';
import { listLegalPages, getLegalPage, createLegalPage, updateLegalPage, deleteLegalPage } from '../controllers/legalPages';

const router = express.Router();

router.use(requireAdminOrShopManager);

router.get('/', listLegalPages);
router.get('/:id', getLegalPage);
router.post('/', createLegalPage);
router.patch('/:id', updateLegalPage);
router.delete('/:id', deleteLegalPage);

export default router;

