import { Router } from 'express';
import { checkPincode, calculateShipping, trackShipment } from '../controllers/shiprocket';

const router = Router();

// Check pincode serviceability
router.post('/check-pincode', checkPincode);

// Calculate shipping rates
router.post('/calculate-shipping', calculateShipping);

// Track shipment by AWB number
router.get('/track/:awb', trackShipment);

export default router;
