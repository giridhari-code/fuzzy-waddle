const InventoryTrend = require('../models/InventoryTrend');

const trackInventoryChange = async (userId, changeType, quantity) => {
    const now = new Date();
    const month = now.getMonth() + 1; // Month is 0-indexed
    const year = now.getFullYear();

    // Check if a trend document already exists for the current month and year
    let trend = await InventoryTrend.findOne({ user: userId, month, year });

    if (!trend) {
        // If not, create a new one
        trend = new InventoryTrend({ user: userId, month, year });
    }

    // Update the stock based on the change type
    if (changeType === 'stockIn') {
        trend.stockIn += quantity;
    } else if (changeType === 'stockOut') {
        trend.stockOut += quantity;
    }

    await trend.save();
};

module.exports = trackInventoryChange;
