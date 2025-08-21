const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Received', 'Cancelled'],
    default: 'Pending',
  },
  total_amount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);