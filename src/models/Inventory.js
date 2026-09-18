const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  productName: { type: String },
  sku: { type: String, unique: true, required: true },
  availableStock: { type: Number, default: 100, min: 0 },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock',
  },
}, { timestamps: true });

// Auto-compute status before save
inventorySchema.pre('save', function (next) {
  if (this.availableStock === 0) this.status = 'Out of Stock';
  else if (this.availableStock < 10) this.status = 'Low Stock';
  else this.status = 'In Stock';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
