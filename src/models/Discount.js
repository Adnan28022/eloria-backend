const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['Percentage', 'Fixed Amount'], required: true },
  value: { type: String, required: true },
  usesCount: { type: Number, default: 0 },
  expiryDate: { type: String, default: 'Never' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
