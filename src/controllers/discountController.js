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

const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json(errorResponse('Coupon code is required'));

    const discount = await Discount.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!discount) return res.status(404).json(errorResponse('Invalid coupon code'));

    // Check expiry
    if (discount.expiryDate && discount.expiryDate !== 'Never') {
      const expiry = new Date(discount.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (new Date() > expiry) {
        return res.status(400).json(errorResponse('This coupon has expired'));
      }
    }

    // Check minimum order
    if (discount.minOrder > 0 && cartTotal < discount.minOrder) {
      return res.status(400).json(errorResponse(`Minimum order of Rs ${discount.minOrder.toLocaleString()} required for this coupon`));
    }

    // Calculate discount amount
    const value = parseFloat(discount.value);
    let discountAmount = 0;
    if (discount.type === 'Percentage') {
      discountAmount = Math.round((cartTotal * value) / 100);
    } else {
      discountAmount = Math.min(value, cartTotal);
    }
    const finalTotal = cartTotal - discountAmount;

    res.json(successResponse({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      finalTotal
    }, `Coupon applied! You save Rs ${discountAmount.toLocaleString()}`));
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

module.exports = { getDiscounts, createDiscount, deleteDiscount, validateCoupon };
