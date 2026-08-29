const Order = require('../models/Order');
const { validateOrderPayload } = require('../utils/validators');

function toPublicOrder(order) {
  return {
    id: order._id,
    buyer: order.buyer,
    seller: order.seller,
    items: order.items,
    total: order.total,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
  };
}

// Sub Task 7.4 — application logic for placing a pay-on-delivery order.
const placeOrder = async (req, res) => {
  const errors = validateOrderPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { items, seller, deliveryAddress } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const order = await Order.create({
      buyer: req.user.id,
      seller,
      items,
      total,
      deliveryAddress,
      paymentMethod: 'pay_on_delivery',
      status: 'placed',
    });
    return res.status(201).json(toPublicOrder(order));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Sub Task 8.1 — live order queue for sellers: every order placed
// against this seller, most recent first.
const listSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders.map(toPublicOrder));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, listSellerOrders, toPublicOrder };
