const Inventory = require('../models/Inventory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate('product', 'name image category price');
    res.json(successResponse(inventory));
  } catch (error) {
    next(error);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const { availableStock } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json(errorResponse('Inventory item not found'));
    
    item.availableStock = availableStock;
    await item.save(); // triggers pre-save hook to auto-update status

    // Sync Product model stock
    const Product = require('../models/Product');
    await Product.findByIdAndUpdate(item.product, { stock: availableStock });

    res.json(successResponse(item, 'Stock updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, updateInventory };
