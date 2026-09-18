const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.post('/', createOrder);

// Admin protected
router.get('/', authMiddleware, getOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);

module.exports = router;
