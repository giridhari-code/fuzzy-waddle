const mongoose = require('mongoose');

const inventoryTrendSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    stockIn: {
        type: Number,
        default: 0,
    },
    stockOut: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const InventoryTrend = mongoose.model('InventoryTrend', inventoryTrendSchema);

module.exports = InventoryTrend;
