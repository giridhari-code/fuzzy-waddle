const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// अपने Mongoose models को import करें
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose'); // aggregation के लिए

// यह route 'protect' middleware का उपयोग करके सुरक्षित है
router.get('/', protect, async (req, res) => {
  try {
    // authenticated user का ID
    const userId = req.user.id;

    // 1. Inventory Status
    const totalItems = await Product.countDocuments({ user: userId });
    const lowStockItems = await Inventory.countDocuments({ user: userId, quantity: { $lt: 50 } });

    // 2. Orders in Progress
    const pendingOrders = await PurchaseOrder.countDocuments({ user: userId, status: 'Pending' });
    const shippedOrders = await PurchaseOrder.countDocuments({ user: userId, status: 'Shipped' });
    const deliveredOrders = await PurchaseOrder.countDocuments({ user: userId, status: 'Delivered' });

    // 3. Monthly Trends (Stock In/Out)
    const monthlyStockIn = await PurchaseOrder.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalQuantity: { $sum: "$totalQuantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyStockOut = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalQuantity: { $sum: "$totalQuantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const stockIn = monthlyStockIn.find(item => item._id === month)?.totalQuantity || 0;
        const stockOut = monthlyStockOut.find(item => item._id === month)?.totalQuantity || 0;
        const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'short' });
        return { name: monthName, stockIn, stockOut };
    });

    // 4. Notifications
    const notifications = [{ id: 1, message: "No new notifications.", type: "info" }];

    // 5. Inventory Table
    const inventoryList = await Inventory.find({ user: userId })
        .populate('product_id', 'name sku')
        .populate('warehouse_id', 'name')
        .limit(10);

    // 6. Vendors
    const vendorList = await Vendor.find({ user: userId }).limit(10);

    const dashboardData = {
      inventoryStatus: {
        totalItems,
        lowStockItems,
      },
      ordersInProgress: {
        pending: pendingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      },
      monthlyTrends,
      notifications,
      inventory: inventoryList.map(item => ({
          sku: item.product_id ? item.product_id.sku : 'N/A',
          itemName: item.product_id ? item.product_id.name : 'N/A',
          currentStock: item.quantity,
          reorder: item.reorderLevel,
          status: item.quantity < 50 ? 'Low' : 'OK'
      })),
      suppliers: vendorList.map(vendor => ({
          supplierName: vendor.name,
          contact: vendor.contact_person || vendor.email
      }))
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
