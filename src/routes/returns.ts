import express from 'express';
import {
  submitReturnRequest,
  getMyReturnRequests,
  getReturnRequestByOrder,
  getAllReturnRequests,
  updateReturnRequest,
} from '../controllers/returns';
import { authenticateToken } from '../controllers/auth';

const router = express.Router();

router.post('/', authenticateToken, submitReturnRequest);
router.get('/my', authenticateToken, getMyReturnRequests);
router.get('/order/:orderId', authenticateToken, getReturnRequestByOrder);
router.get('/admin/all', authenticateToken, getAllReturnRequests);
router.patch('/admin/:id', authenticateToken, updateReturnRequest);

export default router;
