import { Router } from 'express';
import { checkPincode, calculateShipping } from '../controllers/shiprocket';

const router = Router();

// Check pincode serviceability
router.post('/check-pincode', checkPincode);

// Calculate shipping rates
router.post('/calculate-shipping', calculateShipping);

export default router;
