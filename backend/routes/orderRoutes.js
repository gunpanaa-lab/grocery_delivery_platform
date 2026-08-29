const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { placeOrder, listSellerOrders } = require('../controllers/orderController');

const router = express.Router();

// Buyer-only (GROC-58).
router.post('/', protect, requireRole('buyer'), placeOrder);

// Seller-only live order queue (GROC-67). Status-update routes
// (GROC-76) and the buyer order-tracking read route (Epic 5) are
// added to this same router as those user stories land.
router.get('/mine', protect, requireRole('seller'), listSellerOrders);

module.exports = router;
