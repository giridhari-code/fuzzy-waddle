const express = require('express');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseItem = require('../models/PurchaseItem');
const router = express.Router();

// Create a new purchase order with multiple items
router.post('/purchase-orders', async (req, res) => {
  try {
    const { vendor_id, warehouse_id, items } = req.body;

    const newPurchaseOrder = new PurchaseOrder({ vendor_id, warehouse_id });
    await newPurchaseOrder.save();

    let totalAmount = 0;
    const purchaseItems = items.map(item => {
      totalAmount += item.quantity * item.unit_price;
      return new PurchaseItem({
        purchase_order_id: newPurchaseOrder._id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      });
    });

    await PurchaseItem.insertMany(purchaseItems);

    newPurchaseOrder.total_amount = totalAmount;
    await newPurchaseOrder.save();

    res.status(201).json(newPurchaseOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a single purchase order by ID with populated items
router.get('/purchase-orders/:id', async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendor_id', 'name')
      .populate('warehouse_id', 'name');

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const purchaseItems = await PurchaseItem.find({ purchase_order_id: req.params.id })
      .populate('product_id', 'name sku');

    res.status(200).json({ ...purchaseOrder._doc, items: purchaseItems });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;