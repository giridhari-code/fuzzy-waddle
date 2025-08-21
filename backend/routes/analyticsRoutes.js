const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Order = require('../models/Order');
const Sales = require('../models/Sales');
const Customer = require('../models/Customer');
const PurchaseOrder = require('../models/PurchaseOrder'); // Assume you have a PurchaseOrder model

router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // --- 1. Basic Counts & Inventory Value ---
    const totalProducts = await Product.countDocuments({ user: userId });
    const totalWarehouses = await Warehouse.countDocuments({ user: userId });
    const totalCustomers = await Customer.countDocuments({ user: userId });

    const inventoryValueResult = await Product.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$price', '$currentStock'] } }
        }
      }
    ]);
    const totalInventoryValue = inventoryValueResult.length > 0 ? inventoryValueResult[0].total : 0;

    // --- 2. Monthly Sales Trends ---
    const monthlySalesTrends = await Sales.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $month: '$saleDate' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySalesTrends.map(item => ({
      month: monthNames[item._id - 1],
      revenue: item.revenue
    }));

    // --- 3. Top 5 Selling Products ---
    const topSellingProducts = await Order.aggregate([
      { $match: { user: userId, status: 'Delivered' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          salesVolume: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.priceAtPurchase', '$products.quantity'] } }
        }
      },
      { $sort: { salesVolume: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          name: '$productDetails.name',
          salesVolume: 1,
          revenue: 1
        }
      }
    ]);

    // --- 4. Monthly Stock Movement (Stock In vs. Stock Out) ---
    const stockOut = await Order.aggregate([
      { $match: { user: userId, status: 'Delivered' } },
      { $group: { _id: { $month: '$orderDate' }, count: { $sum: 1 } } },
      { $project: { month: '$_id', stockOut: '$count', _id: 0 } },
      { $sort: { month: 1 } }
    ]);
    const stockIn = await PurchaseOrder.aggregate([
      { $match: { user: userId, status: 'Received' } },
      { $group: { _id: { $month: '$orderDate' }, count: { $sum: 1 } } },
      { $project: { month: '$_id', stockIn: '$count', _id: 0 } },
      { $sort: { month: 1 } }
    ]);

    // Combine stockIn and stockOut data
    const monthlyStockMovement = monthNames.map((name, index) => {
        const monthNumber = index + 1;
        const stockInCount = stockIn.find(item => item.month === monthNumber)?.stockIn || 0;
        const stockOutCount = stockOut.find(item => item.month === monthNumber)?.stockOut || 0;
        return { month: name, stockIn: stockInCount, stockOut: stockOutCount };
    });

    // --- 5. Top 5 Customers by Revenue ---
    const topCustomers = await Sales.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$customer',
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customerDetails'
          }
        },
        { $unwind: '$customerDetails' },
        {
          $project: {
            customerName: '$customerDetails.name',
            companyName: '$customerDetails.companyName',
            totalRevenue: 1,
            _id: 0
          }
        }
    ]);

    res.status(200).json({
      totalProducts,
      totalWarehouses,
      totalCustomers,
      totalInventoryValue,
      monthlySalesTrends: formattedMonthlySales,
      topSellingProducts,
      monthlyStockMovement, // New data
      topCustomers,       // New data
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
