import express from 'express';
import { uploadImage, uploadImages, upload } from '../controllers/upload';

const router = express.Router();

// Upload single image
router.post('/single', upload.single('image'), uploadImage);

// Upload multiple images
router.post('/multiple', upload.array('images', 10), uploadImages);

export default router;
