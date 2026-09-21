const express = require('express');
const router = express.Router();
const { getDiscounts, createDiscount, deleteDiscount, validateCoupon } = require('../controllers/discountController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route - validate coupon (no auth needed)
router.post('/validate', validateCoupon);

router.use(authMiddleware);
router.get('/', getDiscounts);
router.post('/', createDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
