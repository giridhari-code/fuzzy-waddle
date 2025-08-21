const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Warehouse name is required.'],
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required.'],
    unique: true,
  },
  location: {
    type: String,
    required: [true, 'Warehouse location is required.'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
