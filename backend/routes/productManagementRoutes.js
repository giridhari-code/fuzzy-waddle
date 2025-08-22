const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Validation middleware for product creation
const validateCreateProduct = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
    body('cost').isFloat({ gt: 0 }).withMessage('Cost must be a number greater than 0'),
];

// Validation middleware for product update
const validateUpdateProduct = [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
    body('unit').optional().trim().notEmpty().withMessage('Unit cannot be empty'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
    body('cost').optional().isFloat({ gt: 0 }).withMessage('Cost must be a number greater than 0'),
];


/**
 * @desc    Get all products with pagination and search
 * @route   GET /api/product-management?page=<page_number>&limit=<items_per_page>&search=<search_term>
 * @access  Private
 * * This route now includes a filter to only return products that are not soft-deleted.
 * Search is also improved to be more robust.
 */
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const searchTerm = req.query.search || '';
        const skip = (page - 1) * limit;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        let query = { user: userId, isDeleted: { $ne: true } }; // Add soft-delete filter

        if (searchTerm) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: new RegExp(searchTerm, 'i') } }, // Use RegExp for better handling
                    { sku: { $regex: new RegExp(searchTerm, 'i') } }
                ]
            };
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query).skip(skip).limit(limit).lean(); // Use .lean() for faster queries

        res.status(200).json({
            products,
            totalProducts,
            page,
            limit
        });
    } catch (error) {
        console.error("Error in GET /api/product-management:", error);
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});

/**
 * @desc    Create a new product
 * @route   POST /api/product-management
 * @access  Private
 * * This is a new route to create a new product in the database.
 * It now includes input validation to ensure all required fields are present and correctly formatted.
 */
router.post('/', protect, validateCreateProduct, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, sku, description, unit, price, cost } = req.body;

        // Check if a product with the same SKU already exists for this user
        const existingProduct = await Product.findOne({ sku, user: req.user.id });
        if (existingProduct) {
            return res.status(409).json({ message: 'Product with this SKU already exists' });
        }

        // Create the new product
        const newProduct = new Product({
            user: req.user.id,
            name,
            sku,
            description,
            unit,
            price,
            cost
        });

        const createdProduct = await newProduct.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("Error in POST /api/product-management:", error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

/**
 * @desc    Update a product
 * @route   PUT /api/product-management/:id
 * @access  Private
 * * This route now includes better error messages and ensures the product is not soft-deleted before updating.
 */
router.put('/:id', protect, validateUpdateProduct, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, sku, description, unit, price, cost } = req.body;
        const { id } = req.params;

        // Check if the product exists and belongs to the user and is not soft-deleted
        const existingProduct = await Product.findOne({ _id: id, user: req.user.id, isDeleted: { $ne: true } });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found or not authorized to update' });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, user: req.user.id, isDeleted: { $ne: true } },
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

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error in PUT /api/product-management:", error);
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

/**
 * @desc    Soft-delete a product (mark as deleted)
 * @route   DELETE /api/product-management/:id
 * @access  Private
 * * This route now performs a soft-delete by setting the `isDeleted` flag to true.
 * The product is not removed from the database.
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product and check if it's not already deleted
        const productToSoftDelete = await Product.findOne({ _id: id, user: req.user.id, isDeleted: { $ne: true } });

        if (!productToSoftDelete) {
            return res.status(404).json({ message: 'Product not found, already deleted, or not authorized to delete' });
        }

        // Soft-delete the product
        productToSoftDelete.isDeleted = true;
        await productToSoftDelete.save();

        res.status(200).json({ message: 'Product successfully soft-deleted' });
    } catch (error) {
        console.error("Error in DELETE /api/product-management:", error);
        res.status(500).json({ message: 'Error soft-deleting product', error: error.message });
    }
});

/**
 * @desc    Recover a soft-deleted product
 * @route   PATCH /api/product-management/:id/recover
 * @access  Private
 * * This is a new route to un-delete a soft-deleted product.
 */
router.patch('/:id/recover', protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product and check if it's already soft-deleted
        const productToRecover = await Product.findOne({ _id: id, user: req.user.id, isDeleted: true });

        if (!productToRecover) {
            return res.status(404).json({ message: 'Product not found or is not soft-deleted' });
        }

        // Recover the product
        productToRecover.isDeleted = false;
        await productToRecover.save();

        res.status(200).json({ message: 'Product successfully recovered', product: productToRecover });
    } catch (error) {
        console.error("Error in PATCH /api/product-management/recover:", error);
        res.status(500).json({ message: 'Error recovering product', error: error.message });
    }
});

module.exports = router;
