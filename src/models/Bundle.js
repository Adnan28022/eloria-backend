const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bundle name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Bundle price is required']
  },
  compareAtPrice: {
    type: Number, // Original price sum (for showing discount)
  },
  image: {
    type: String,
    required: [true, 'Bundle main image is required']
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Bundle', bundleSchema);
