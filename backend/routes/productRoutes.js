const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/products
// @desc    Fetch all products for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, sku, unit, price } = req.body;
  if (!name || !sku || !unit || !price) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }
  try {
    const product = new Product({ name, sku, unit, price, user: req.user.id });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product by its ID
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { name, sku, unit, price } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.unit = unit || product.unit;
    product.price = price || product.price;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by its ID
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
