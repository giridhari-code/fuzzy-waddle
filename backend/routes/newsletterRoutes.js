const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber'); // ✅ Mongoose model import

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'You are already subscribed!' });
    }

    // Save new subscriber
    await Subscriber.create({ email });

    return res.status(200).json({ message: 'Thank you for subscribing!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
