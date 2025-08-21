// routes/inventoryAnalyticsRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Sales = require('../models/Sales');
const Warehouse = require('../models/Warehouse'); // सुनिश्चित करें कि आपने इसे भी आयात किया है

router.get('/dashboard-data', protect, async (req, res) => {
  try {
    const user = req.user.id;

    // 1. कुल उत्पाद
    const totalProducts = await Product.countDocuments({ user });

    // 2. वेयरहाउस के अनुसार इन्वेंट्री
    const inventoryByWarehouse = await Inventory.aggregate([
      // $match को सीधे `user` के साथ अपडेट किया गया
      { $match: { user: new mongoose.Types.ObjectId(user) } },
      {
        $group: {
          _id: '$warehouse_id',
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'warehouses', // 'warehouses' collection का नाम
          localField: '_id',
          foreignField: '_id',
          as: 'warehouseDetails',
        },
      },
      { $unwind: { path: '$warehouseDetails', preserveNullAndEmptyArrays: true } }, // $unwind को सुरक्षित बनाने के लिए
      {
        $project: {
          _id: 0,
          warehouseName: '$warehouseDetails.name',
          totalQuantity: 1,
        },
      },
    ]);

    // 3. कुल ऑर्डर और राजस्व (Revenue)
    const totalSales = await Sales.countDocuments({ user });
    const totalRevenue = await Sales.aggregate([
      // $match को सीधे `user` के साथ अपडेट किया गया
      { $match: { user: new mongoose.Types.ObjectId(user) } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // 4. नए उत्पाद (पिछले 30 दिनों में)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newProducts = await Product.countDocuments({ user, createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      totalProducts,
      inventoryByWarehouse,
      totalSales,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      newProducts,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
