const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  placeOrder,
  listSellerOrders,
  updateOrderStatus,
  getOrderById,
} = require('../controllers/orderController');

const router = express.Router();

// Buyer-only (GROC-58).
router.post('/', protect, requireRole('buyer'), placeOrder);

// Seller-only (GROC-67, GROC-76). Registered ahead of the buyer
// GET /:id route below so '/mine' isn't swallowed by the :id param.
router.get('/mine', protect, requireRole('seller'), listSellerOrders);
router.patch('/:id/status', protect, requireRole('seller'), updateOrderStatus);

// Buyer-only order tracking (GROC-86).
router.get('/:id', protect, requireRole('buyer'), getOrderById);

module.exports = router;
