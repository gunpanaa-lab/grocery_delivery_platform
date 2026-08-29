const mongoose = require('mongoose');

const CATEGORIES = ['produce', 'dairy', 'bakery', 'meat', 'pantry', 'beverages', 'household', 'other'];

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, default: 'other' },
    imageUrl: { type: String, default: '' },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
