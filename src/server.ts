import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';

// Import Routes
import dashboardRoutes from './routes/dashboard';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import subCategoryRoutes from './routes/subcategories';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import bannerRoutes from './routes/banners';
import navigationRoutes from './routes/navigation';
import notificationRoutes from './routes/notifications';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import uploadRoutes from './routes/upload';
import couponRoutes from './routes/coupons';
import settingsRoutes from './routes/settings';
import reportsRoutes from './routes/reports';
import shiprocketRoutes from './routes/shiprocket';

// Load environment variables
dotenv.config();

const app: Application = express();

// Do not disclose Express version to clients (S5689)
app.disable('x-powered-by');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (same path as upload controller)
const uploadsPublicDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '../uploads/public');
app.use('/uploads', express.static(uploadsPublicDir));

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/shiprocket', shiprocketRoutes);

// Public routes (for client frontend)
app.use('/api/public', publicRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tobo Backend API',
    version: '1.0.0',
    status: 'Running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;



