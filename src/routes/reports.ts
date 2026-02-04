import express from 'express';
import {
  getReportCustomers,
  getReportOrders,
  getReportSales,
  getReportStock,
} from '../controllers/reports';
import { requireAdmin } from '../controllers/auth';

const router = express.Router();
router.use(requireAdmin);

router.get('/customers', getReportCustomers);
router.get('/orders', getReportOrders);
router.get('/sales', getReportSales);
router.get('/stock', getReportStock);

export default router;
