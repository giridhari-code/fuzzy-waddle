const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/inventory
// @desc    Fetch all inventory records for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const inventory = await Inventory.find({ user: req.user.id })
      // Populating with correct field names from the model
      .populate('product_id', 'name sku')
      .populate('warehouse_id', 'name code');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/inventory
// @desc    Add a new inventory record
// @access  Private
router.post('/', protect, async (req, res) => {
  // Using product_id, warehouse_id, and quantity to match the model
  const { product_id, warehouse_id, quantity } = req.body;
  try {
    const newInventory = new Inventory({
      product_id,
      warehouse_id,
      quantity,
      user: req.user.id,
    });
    const savedInventory = await newInventory.save();
    // Populate the saved record to return full details
    const populatedInventory = await savedInventory
      .populate('product_id', 'name sku')
      .populate('warehouse_id', 'name code');
    res.status(201).json(populatedInventory);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    // Duplicate key error for product and warehouse
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Validation failed', errors: ['An inventory record for this product in this warehouse already exists.'] });
    }
    res.status(400).json({ message: 'Could not create inventory record', error: err.message });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update an inventory record
// @access  Private
router.put('/:id', protect, async (req, res) => {
  // Using quantity to match the model
  const { quantity } = req.body;
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    if (inventory.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Using inventory.quantity to update
    inventory.quantity = quantity !== undefined ? quantity : inventory.quantity;
    const updatedInventory = await inventory.save();
    res.json(updatedInventory);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(400).json({ message: 'Could not update inventory record', error: err.message });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete an inventory record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }
    if (inventory.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Inventory.deleteOne({ _id: req.params.id });
    res.json({ message: 'Inventory record removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
