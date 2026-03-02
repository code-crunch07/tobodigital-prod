import express from 'express';
import { requireAdminOrShopManager } from '../controllers/auth';
import { listArticles, getArticle, createArticle, updateArticle, deleteArticle } from '../controllers/articles';

const router = express.Router();

router.use(requireAdminOrShopManager);

router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/', createArticle);
router.patch('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;

