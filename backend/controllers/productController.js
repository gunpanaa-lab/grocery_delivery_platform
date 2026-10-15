const Product = require('../models/Product');
const { validateProductPayload } = require('../utils/validators');

function toPublicProduct(product) {
  return {
    id: product._id,
    seller: product.seller,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    stockQty: product.stockQty > 0 ? product.stockQty : 0,
    inStock: product.inStock,
  };
}

// Sub Task 3.5 — application logic for creating and editing products.
// Every mutation is scoped to req.user.id (the authenticated seller) so
// one seller can never read or modify another seller's catalog.

const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json(products.map(toPublicProduct));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// stockQty is optional on create — a seller can list an item before
// they've counted stock, and it defaults to 0 (out of stock) until
// they set a quantity via the form or the inline stepper.
const createProduct = async (req, res) => {
  const errors = validateProductPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { name, description, price, category, imageUrl, stockQty } = req.body;
  const numericQty = stockQty === undefined || stockQty === null || stockQty === '' ? 0 : Number(stockQty);

  try {
    const product = await Product.create({
      seller: req.user.id,
      name,
      description,
      price,
      category,
      imageUrl,
      stockQty: numericQty > 0 ? numericQty : 0,
      inStock: numericQty > 0,
    });
    return res.status(201).json(toPublicProduct(product));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// stockQty is only touched here when the full edit form sends it. The
// quick inline stepper on the seller's shop list goes through
// updateProductStock below instead, so a seller tweaking the price
// alone (no stockQty in the body) never resets their quantity to 0.
const updateProduct = async (req, res) => {
  const errors = validateProductPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (String(product.seller) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only edit your own items' });
    }

    const { name, description, price, category, imageUrl, stockQty } = req.body;
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl;

    if (stockQty !== undefined && stockQty !== null && stockQty !== '') {
      const numericQty = Number(stockQty);
      product.stockQty = numericQty;
      product.inStock = numericQty > 0;
    }

    await product.save();

    return res.json(toPublicProduct(product));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (String(product.seller) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own items' });
    }

    await product.deleteOne();
    return res.json({ message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Sub Task 5.5 — public storefront listing for buyers: only in-stock
// items, optionally filtered by category and/or a text search across
// name/description (backed by the text index on the Product model).
const browseProducts = async (req, res) => {
  const { search, category } = req.query;
  const filter = { inStock: true };
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  try {
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json(products.map(toPublicProduct));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// New — seller sets the exact stock quantity for an item (the inline
// +/- stepper on the "My shop" list calls this on every click).
// inStock is derived automatically from the quantity rather than
// toggled by hand, so the badge buyers see can never go stale.
const updateProductStock = async (req, res) => {
  const { quantity } = req.body;
  const numericQuantity = Number(quantity);

  if (
    quantity === undefined ||
    quantity === null ||
    quantity === '' ||
    Number.isNaN(numericQuantity) ||
    numericQuantity < 0 ||
    !Number.isInteger(numericQuantity)
  ) {
    return res.status(400).json({ message: 'quantity must be a whole number of 0 or more' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (String(product.seller) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only update your own items' });
    }

    product.stockQty = numericQuantity;
    product.inStock = numericQuantity > 0;
    await product.save();

    return res.json(toPublicProduct(product));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listMyProducts,
  browseProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toPublicProduct,
};
