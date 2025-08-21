const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please add a product name']
  },
  sku: {
    type: String,
    required: [true, 'Please add an SKU']
  },
  description: {
    type: String
  },
  unit: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  cost: {
    type: Number,
    required: [true, 'Please add a cost'],
    min: 0
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
