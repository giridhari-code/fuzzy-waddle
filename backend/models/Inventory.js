const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
  },
  quantity: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
});

inventorySchema.index({ product_id: 1, warehouse_id: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
