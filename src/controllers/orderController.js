const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendOrderConfirmationEmail } = require('../utils/mailService');

// @route POST /api/orders — Public (checkout)
const createOrder = async (req, res, next) => {
  try {
    const { customer, shippingAddress, items, subtotal, shipping, total, notes } = req.body;

    const order = await Order.create({
      customer,
      shippingAddress,
      items,
      subtotal,
      shipping: shipping || 0,
      total,
      notes,
    });

    // Decrement stock in both Product and Inventory models
    const Product = require('../models/Product');
    const Inventory = require('../models/Inventory');

    for (const item of items) {
      if (item.productId) {
        // Decrease from Product
        const prod = await Product.findById(item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          await prod.save();
        }

        // Decrease from Inventory
        const inv = await Inventory.findOne({ product: item.productId });
        if (inv) {
          inv.availableStock = Math.max(0, inv.availableStock - item.quantity);
          await inv.save();
        }
      }
    }

    // Auto-create or update customer
    const existingCustomer = await Customer.findOne({ email: customer.email.toLowerCase() });
    if (existingCustomer) {
      existingCustomer.ordersCount += 1;
      existingCustomer.totalSpent += total;
      existingCustomer.status = 'Active';
      await existingCustomer.save();
    } else {
      await Customer.create({
        name: customer.name,
        email: customer.email.toLowerCase(),
        phone: customer.phone || '',
        ordersCount: 1,
        totalSpent: total,
        status: 'Active',
      });
    }

    // If a coupon code was used, increment usesCount and auto-disable if limit reached
    const couponCode = req.body.couponCode || req.body.discountCode;
    if (couponCode) {
      try {
        const Discount = require('../models/Discount');
        const discount = await Discount.findOne({ code: couponCode.toUpperCase().trim() });
        if (discount) {
          discount.usesCount = (discount.usesCount || 0) + 1;
          if (discount.usageLimit > 0 && discount.usesCount >= discount.usageLimit) {
            discount.isActive = false;
          }
          await discount.save();
        }
      } catch (discErr) {
        console.error('Error updating discount usage:', discErr.message);
      }
    }

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(order).catch(console.error);

    res.status(201).json(successResponse(order, 'Order placed successfully'));
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/orders — Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(successResponse(orders));
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/orders/:id/status — Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(errorResponse('Order not found'));

    const oldStatus = order.status;
    const newStatus = status;

    order.status = newStatus;
    await order.save();

    const isOldCancelled = oldStatus === 'Cancelled' || oldStatus === 'Returned';
    const isNewCancelled = newStatus === 'Cancelled' || newStatus === 'Returned';

    if (isNewCancelled && !isOldCancelled) {
      // Order is being cancelled/returned -> Increase stock
      const Product = require('../models/Product');
      const Inventory = require('../models/Inventory');
      for (const item of order.items) {
        // Find by productId if available, otherwise fallback to item.product from POS
        const prodId = item.productId || item.product;
        if (prodId) {
          const prod = await Product.findById(prodId);
          if (prod) {
            prod.stock += item.quantity;
            await prod.save();
          }
          const inv = await Inventory.findOne({ product: prodId });
          if (inv) {
            inv.availableStock += item.quantity;
            await inv.save();
          }
        }
      }
    } else if (!isNewCancelled && isOldCancelled) {
      // Order was cancelled/returned, but now it's active again -> Decrease stock
      const Product = require('../models/Product');
      const Inventory = require('../models/Inventory');
      for (const item of order.items) {
        const prodId = item.productId || item.product;
        if (prodId) {
          const prod = await Product.findById(prodId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
            await prod.save();
          }
          const inv = await Inventory.findOne({ product: prodId });
          if (inv) {
            inv.availableStock = Math.max(0, inv.availableStock - item.quantity);
            await inv.save();
          }
        }
      }
    }

    res.json(successResponse(order, 'Order status updated'));
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/orders/:id — Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json(errorResponse('Order not found'));
    res.json(successResponse(null, 'Order deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, deleteOrder };
