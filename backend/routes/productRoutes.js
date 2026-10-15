const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  listMyProducts,
  browseProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} = require('../controllers/productController');

const router = express.Router();

// Public buyer storefront (GROC-39) — no auth required.
router.get('/', browseProducts);

// Seller-only catalog management (GROC-21, GROC-30).
router.get('/mine', protect, requireRole('seller'), listMyProducts);
router.post('/', protect, requireRole('seller'), createProduct);
router.put('/:id', protect, requireRole('seller'), updateProduct);
router.delete('/:id', protect, requireRole('seller'), deleteProduct);
// Same path as before — the contract changed from { inStock } to
// { quantity }, with inStock now derived server-side.
router.patch('/:id/stock', protect, requireRole('seller'), updateProductStock);

module.exports = router;
