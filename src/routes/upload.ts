import express from 'express';
import { uploadImage, uploadImages, upload } from '../controllers/upload';
import { requireAdminOrShopManager } from '../controllers/auth';

const router = express.Router();

router.use(requireAdminOrShopManager);

// Upload single image
router.post('/single', upload.single('image'), uploadImage);

// Upload multiple images
router.post('/multiple', upload.array('images', 10), uploadImages);

export default router;
