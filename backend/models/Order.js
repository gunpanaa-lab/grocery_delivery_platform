const mongoose = require('mongoose');

const ORDER_STATUSES = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Denormalized onto the order at checkout time, since a seller's
    // catalog may change after the order is placed (GROC-58).
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    total: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    paymentMethod: { type: String, enum: ['pay_on_delivery'], default: 'pay_on_delivery' },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
