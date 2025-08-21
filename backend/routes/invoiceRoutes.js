const express = require('express');
const Invoice = require('../models/Invoice');
const router = express.Router();

// Create a new invoice
router.post('/invoices', async (req, res) => {
  try {
    const { user_id, warehouse_id, customer_name, items } = req.body;

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.unit_price;
    });

    const newInvoice = new Invoice({
      user_id,
      warehouse_id,
      customer_name,
      items,
      total_amount: totalAmount,
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('user_id', 'name email')
      .populate('warehouse_id', 'name')
      .populate('items.product_id', 'name sku');
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;