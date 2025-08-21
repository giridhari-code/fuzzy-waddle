const express = require('express');
const Vendor = require('../models/Vendor');
const router = express.Router();

// Create a new vendor
router.post('/vendors', async (req, res) => {
  try {
    const newVendor = new Vendor(req.body);
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;