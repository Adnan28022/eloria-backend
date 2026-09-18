const express = require('express');
const router = express.Router();
const { getPublicDeals, getAllDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route for frontend
router.get('/public', getPublicDeals);

// Admin routes
router.get('/', authMiddleware, getAllDeals);
router.post('/', authMiddleware, createDeal);
router.put('/:id', authMiddleware, updateDeal);
router.delete('/:id', authMiddleware, deleteDeal);

module.exports = router;
