const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStock,
} = require('../controllers/productController');

const router = express.Router();

// Seller-only catalog management (GROC-21, GROC-30). Buyer-facing
// browse/search (GROC-39) is added as public routes on this same
// router later.
router.get('/mine', protect, requireRole('seller'), listMyProducts);
router.post('/', protect, requireRole('seller'), createProduct);
router.put('/:id', protect, requireRole('seller'), updateProduct);
router.delete('/:id', protect, requireRole('seller'), deleteProduct);
router.patch('/:id/stock', protect, requireRole('seller'), setProductStock);

module.exports = router;
