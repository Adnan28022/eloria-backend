require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const discountRoutes = require('./src/routes/discountRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const miscRoutes = require('./src/routes/miscRoutes');
const dealRoutes = require('./src/routes/dealRoutes');
const bundleRoutes = require('./src/routes/bundleRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://eloria-frontend-jt9c.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route - API Info
app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.json({
    success: true,
    name: 'Eloria Skincare API',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus[dbState] || 'Unknown',
      connected: dbState === 1
    },
    endpoints: {
      health: '/health',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      deals: '/api/deals',
      bundles: '/api/bundles',
      auth: '/api/auth'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  res.json({ 
    success: true, 
    message: 'Eloria API is running',
    database: dbState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0',
    uptime: process.uptime().toFixed(2) + 's'
  });
});

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api', miscRoutes);

// Admin Routes (protected)
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/discounts', discountRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/deals', dealRoutes);
app.use('/api/admin/bundles', bundleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Eloria Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
