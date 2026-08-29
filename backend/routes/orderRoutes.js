const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { placeOrder } = require('../controllers/orderController');

const router = express.Router();

// Buyer-only (GROC-58). Seller order-queue/status-update routes
// (Epic 4) and the buyer order-tracking read route (Epic 5) are added
// to this same router as those epics land.
router.post('/', protect, requireRole('buyer'), placeOrder);

module.exports = router;
