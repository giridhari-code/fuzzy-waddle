const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/warehouse
// @desc    Fetch all warehouses for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ user: req.user.id });
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/warehouse
// @desc    Create a new warehouse
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, code, location } = req.body;

  try {
    const warehouse = new Warehouse({
      name,
      code,
      location,
      user: req.user.id,
    });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (err) {
    // Mongoose validation error और duplicate key error को संभालें
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    // Duplicate code error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
      return res.status(400).json({ message: 'Validation failed', errors: ['Warehouse code must be unique.'] });
    }
    res.status(400).json({ message: 'Could not create warehouse', error: err.message });
  }
});

// @route   PUT /api/warehouse/:id
// @desc    Update a warehouse
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { name, code, location } = req.body;
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    if (warehouse.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    warehouse.name = name || warehouse.name;
    warehouse.code = code || warehouse.code;
    warehouse.location = location || warehouse.location;
    await warehouse.save();
    res.json(warehouse);
  } catch (err) {
    // Mongoose validation error और duplicate key error को संभालें
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    // Duplicate code error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
      return res.status(400).json({ message: 'Validation failed', errors: ['Warehouse code must be unique.'] });
    }
    res.status(400).json({ message: 'Could not update warehouse', error: err.message });
  }
});

// @route   DELETE /api/warehouse/:id
// @desc    Delete a warehouse
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    if (warehouse.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Warehouse.deleteOne({ _id: req.params.id });
    res.json({ message: 'Warehouse removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
