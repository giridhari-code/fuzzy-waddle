require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const warehouseRoutes = require('./routes/warehouseRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const dashboardRoutes = require ('./routes/dashboardRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes');
const productManagementRoutes = require('./routes/productManagementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryAnalyticsRoutes = require('./routes/inventoryAnalyticsRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use routes with specific paths
app.use('/api/warehouse', warehouseRoutes);
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchase-orders', purchaseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventoryRoutes', inventoryRoutes);
app.use('/api/product-management', productManagementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventoryAnalyticsRoutes', inventoryAnalyticsRoutes);



app.get('/', (req, res) => {
  res.send('InventoryIQ Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

