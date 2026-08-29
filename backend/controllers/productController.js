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

const createProduct = async (req, res) => {
  const errors = validateProductPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { name, description, price, category, imageUrl } = req.body;

  try {
    const product = await Product.create({
      seller: req.user.id,
      name,
      description,
      price,
      category,
      imageUrl,
    });
    return res.status(201).json(toPublicProduct(product));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

    const { name, description, price, category, imageUrl } = req.body;
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl;
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

// Sub Task 4.3 — application logic for the in-stock/out-of-stock toggle.
const setProductStock = async (req, res) => {
  const { inStock } = req.body;
  if (typeof inStock !== 'boolean') {
    return res.status(400).json({ message: 'inStock must be true or false' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (String(product.seller) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only update your own items' });
    }

    product.inStock = inStock;
    await product.save();

    return res.json(toPublicProduct(product));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStock,
  toPublicProduct,
};
