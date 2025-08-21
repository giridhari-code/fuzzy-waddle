const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sales = require('../models/Sales'); // Sales model for total revenue
const { Types } = require('mongoose');

// This function will fetch all the necessary data for the dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.user.id);

    // --- Order Status Counts ---
    const deliveredOrdersCount = await Order.countDocuments({ user: userId, status: 'Delivered' });
    const pendingOrdersCount = await Order.countDocuments({ user: userId, status: 'Pending' });
    const shippedOrdersCount = await Order.countDocuments({ user: userId, status: 'Shipped' });

    // --- Inventory Status ---
    const totalItemsCount = await Product.countDocuments({ user: userId });
    const lowStockItemsCount = await Product.countDocuments({ user: userId, currentStock: { $lt: 20 } });

    // --- Sales Data ---
    const totalRevenueResult = await Sales.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const totalCustomersCount = await Customer.countDocuments({ user: userId });

    // --- Recent Orders ---
    const recentOrders = await Order.find({ user: userId })
      .sort({ orderDate: -1 })
      .limit(5)
      .populate('customer', 'name companyName');

    // --- Combine all the data into one response object ---
    const dashboardData = {
      inventoryStatus: {
        totalItems: totalItemsCount,
        lowStockItems: lowStockItemsCount,
      },
      ordersInProgress: {
        pending: pendingOrdersCount,
        shipped: shippedOrdersCount,
        delivered: deliveredOrdersCount,
      },
      totalRevenue: totalRevenue,
      totalCustomers: totalCustomersCount,
      recentOrders: recentOrders,
      // You can add more data here like monthly trends, notifications, etc.
      // For now, let's keep it simple.
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
