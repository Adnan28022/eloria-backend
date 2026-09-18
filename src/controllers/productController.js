const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route GET /api/products — Public
const getProducts = async (req, res, next) => {
  try {
    const { category, sort, featured } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    let query = Product.find(filter);

    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ isBestSeller: -1, createdAt: -1 });

    const products = await query;
    res.json(successResponse(products));
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/:id — Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }]
    });
    if (!product) return res.status(404).json(errorResponse('Product not found'));
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/products — Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    // Auto-create inventory for new product
    const skuNum = Math.floor(1000 + Math.random() * 9000);
    await Inventory.create({
      product: product._id,
      productName: product.name,
      sku: `ELR-SKU-${skuNum}`,
      availableStock: req.body.stock || 100,
    });
    res.status(201).json(successResponse(product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/products/:id — Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json(errorResponse('Product not found'));

    // Sync inventory stock if stock was updated
    if (req.body.stock !== undefined) {
      const inventory = await Inventory.findOne({ product: product._id });
      if (inventory) {
        inventory.availableStock = req.body.stock;
        await inventory.save(); // Triggers status update hook
      }
    }

    res.json(successResponse(product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/products/:id — Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json(errorResponse('Product not found'));
    await Inventory.findOneAndDelete({ product: req.params.id });
    res.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
