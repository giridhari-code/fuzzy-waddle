const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Sales = require('../models/Sales');
const Product = require('../models/Product');

// ===================== Customer Routes =====================

// @route   GET /api/sales/customers
// @desc    Get all customers for the logged-in user
// @access  Private
router.get('/customers', protect, async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id }).lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/sales/customers
// @desc    Create a new customer
// @access  Private
router.post('/customers', protect, async (req, res) => {
  const { name, companyName, email, phone, address } = req.body;
  try {
    const newCustomer = new Customer({
      name,
      companyName,
      email,
      phone,
      address,
      user: req.user.id,
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Validation failed', errors: ['Email must be unique.'] });
    }
    res.status(400).json({ message: 'Could not create customer', error: err.message });
  }
});

// ===================== Customer Details Route =====================

// @route   GET /api/sales/customers/:id/details
// @desc    Get full details for a specific customer (orders + total sales)
// @access  Private
router.get('/customers/:id/details', protect, async (req, res) => {
  try {
    const customerId = req.params.id;
    const userId = req.user.id;

    const customer = await Customer.findOne({ _id: customerId, user: userId }).lean();
    if (!customer) {
      return res
        .status(404)
        .json({ message: 'Customer not found or not authorized.' });
    }

    // Get all orders for this customer (latest first)
    const orders = await Order.find({ customer: customerId, user: userId })
      .sort({ orderDate: -1 })
      .populate('products.product', 'name sku price')
      .lean();

    // Total sales from delivered orders
    const totalSalesResult = await Sales.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(customerId),
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    res.json({ customer, orders, totalSales });
  } catch (err) {
    console.error('Customer details error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===================== Order Routes =====================

// @route   GET /api/sales/orders
// @desc    Get all orders for the logged-in user
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('customer', 'name companyName')
      .populate('products.product', 'name sku price')
      .lean();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/sales/orders
// @desc    Create a new order
// @access  Private
router.post('/orders', protect, async (req, res) => {
  const { customer, products } = req.body;
  try {
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.product).lean();
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.product} not found.` });
      }
      totalAmount += product.price * item.quantity;
      item.priceAtPurchase = product.price;
    }

    const newOrder = new Order({
      customer,
      products,
      totalAmount,
      user: req.user.id,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(400).json({ message: 'Could not create order', error: err.message });
  }
});

// @route   PATCH /api/sales/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/orders/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this order.' });
    }

    order.status = status;
    await order.save();

    // Sync with Sales collection
    if (status === 'Delivered') {
      const existingSale = await Sales.findOne({ order: orderId });
      if (!existingSale) {
        const newSale = new Sales({
          order: orderId,
          totalAmount: order.totalAmount,
          customer: order.customer,
          user: req.user.id,
        });
        await newSale.save();
      }
    } else {
      await Sales.deleteOne({ order: orderId });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/sales/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/orders/:id', protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: 'User not authorized to delete this order.' });
    }

    await Order.findByIdAndDelete(orderId);
    await Sales.deleteOne({ order: orderId });

    res.json({ message: 'Order and associated sales record deleted successfully.' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===================== Dashboard Route =====================

// @route   GET /api/sales/dashboard
// @desc    Get dashboard data (totals + latest orders with pagination)
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Fetch total revenue, sales, and customers (these do not need pagination)
    const totalRevenueResult = await Sales.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const totalSales = await Sales.countDocuments({ user: userId });
    const totalCustomers = await Customer.countDocuments({ user: userId });

    // Now, fetch latest orders with pagination
    const latestOrders = await Order.find({ user: userId })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name companyName')
      .lean();

    // Fetch the total count of all orders to calculate total pages
    const totalCount = await Order.countDocuments({ user: userId });

    res.json({ totalSales, totalCustomers, totalRevenue, latestOrders, totalCount });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
