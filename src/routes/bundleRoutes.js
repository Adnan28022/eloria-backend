const express = require('express');
const router = express.Router();
const { getPublicBundles, getAllBundles, createBundle, updateBundle, deleteBundle } = require('../controllers/bundleController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route for frontend
router.get('/public', getPublicBundles);

// Admin routes
router.get('/', authMiddleware, getAllBundles);
router.post('/', authMiddleware, createBundle);
router.put('/:id', authMiddleware, updateBundle);
router.delete('/:id', authMiddleware, deleteBundle);

module.exports = router;
