const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get all products with pagination and search
// @route   GET /api/product-management?page=<page_number>&limit=<items_per_page>&search=<search_term>
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const searchTerm = req.query.search || '';
        const skip = (page - 1) * limit;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        let query = { user: userId };

        if (searchTerm) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { sku: { $regex: searchTerm, $options: 'i' } } // ✅ Fixed options
                ]
            };
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query).skip(skip).limit(limit);

        res.status(200).json({
            products,
            totalProducts,
            page,
            limit,

        },
      );

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Create a new product
// @route   POST /api/product-management
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, sku, description, unit, price, cost } = req.body;

        const newProduct = new Product({
            user: req.user.id,
            name,
            sku,
            description,
            unit,
            price,
            cost,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/product-management/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, sku, description, unit, price, cost } = req.body;

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                name,
                sku,
                description,
                unit,
                price,
                cost,
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/product-management/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
