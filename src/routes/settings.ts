import express from 'express';
import {
  getSiteSettings,
  updateSiteSettings,
  getIntegrations,
  updateIntegration,
  listBackups,
  createBackup,
  getProductAttributes,
  updateProductAttributes,
} from '../controllers/settings';
import { requireAdmin } from '../controllers/auth';

const router = express.Router();

router.use(requireAdmin);

router.get('/site', getSiteSettings);
router.patch('/site', updateSiteSettings);
router.get('/integrations', getIntegrations);
router.patch('/integrations/:id', updateIntegration);
router.get('/backups', listBackups);
router.post('/backups', createBackup);
router.get('/product-attributes', getProductAttributes);
router.put('/product-attributes', updateProductAttributes);

export default router;
