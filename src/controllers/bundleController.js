const Bundle = require('../models/Bundle');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route GET /api/bundles (Public)
const getPublicBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find({ isActive: true }).populate('products', 'name price image slug stock');
    res.json(successResponse(bundles));
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/bundles
const getAllBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find().sort({ createdAt: -1 }).populate('products', 'name price image');
    res.json(successResponse(bundles));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/bundles
const createBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.create(req.body);
    res.status(201).json(successResponse(bundle, 'Bundle created successfully'));
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/bundles/:id
const updateBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bundle) return res.status(404).json(errorResponse('Bundle not found'));
    res.json(successResponse(bundle, 'Bundle updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/bundles/:id
const deleteBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndDelete(req.params.id);
    if (!bundle) return res.status(404).json(errorResponse('Bundle not found'));
    res.json(successResponse(null, 'Bundle deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBundles,
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle
};
