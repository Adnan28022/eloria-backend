const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  images: [{ type: String }],
  image: { type: String },
  secondaryImage: { type: String },
  gallery: [{ type: String }],
  category: {
    type: String,
    required: true,
  },
  stock: { type: Number, default: 100, min: 0 },
  skinType: { type: String },
  benefits: [{ type: String }],
  ingredients: [{ type: String }],
  howToUse: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  slug: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
