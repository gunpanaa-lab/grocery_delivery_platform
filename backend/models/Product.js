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
    // New — how many units the seller has on hand. inStock is now
    // derived from this (stockQty > 0) rather than toggled by hand, so
    // the two can never drift out of sync with each other.
    stockQty: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
