const Discount = require('../models/Discount');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(successResponse(discounts));
  } catch (error) {
    next(error);
  }
};

const createDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.create({ ...req.body, code: req.body.code.toUpperCase() });
    res.status(201).json(successResponse(discount, 'Discount created'));
  } catch (error) {
    next(error);
  }
};

const deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json(errorResponse('Discount not found'));
    res.json(successResponse(null, 'Discount deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDiscounts, createDiscount, deleteDiscount };
