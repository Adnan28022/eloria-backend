const express = require('express');
const router = express.Router();
const { getDiscounts, createDiscount, deleteDiscount } = require('../controllers/discountController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getDiscounts);
router.post('/', createDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
