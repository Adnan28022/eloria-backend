const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  bannerImage: {
    type: String,
    default: '/deal-placeholder.png' // Default banner image path
  },
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    default: 'percent'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Scheduled', 'Ended', 'Draft'],
    default: 'Draft'
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
