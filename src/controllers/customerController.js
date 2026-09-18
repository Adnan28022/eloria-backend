const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route GET /api/admin/customers
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(successResponse(customers));
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json(errorResponse('Customer not found'));
    res.json(successResponse(null, 'Customer deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, deleteCustomer };
