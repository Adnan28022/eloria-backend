const Deal = require('../models/Deal');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route GET /api/deals (Public - gets active deals)
const getPublicDeals = async (req, res, next) => {
  try {
    const now = new Date();
    const deals = await Deal.find({
      status: 'Active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('products', 'name price image slug category stock');
    
    res.json(successResponse(deals));
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/deals
const getAllDeals = async (req, res, next) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 }).populate('products', 'name price image');
    res.json(successResponse(deals));
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/deals
const createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create(req.body);
    res.status(201).json(successResponse(deal, 'Deal created successfully'));
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/deals/:id
const updateDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!deal) return res.status(404).json(errorResponse('Deal not found'));
    res.json(successResponse(deal, 'Deal updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/deals/:id
const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json(errorResponse('Deal not found'));
    res.json(successResponse(null, 'Deal deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicDeals,
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal
};
