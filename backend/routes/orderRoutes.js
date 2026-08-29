const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { placeOrder, listSellerOrders, updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();

// Buyer-only (GROC-58).
router.post('/', protect, requireRole('buyer'), placeOrder);

// Seller-only (GROC-67, GROC-76). The buyer order-tracking read route
// (Epic 5) is added to this same router as that epic lands.
router.get('/mine', protect, requireRole('seller'), listSellerOrders);
router.patch('/:id/status', protect, requireRole('seller'), updateOrderStatus);

module.exports = router;
