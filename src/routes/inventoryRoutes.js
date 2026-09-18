const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getInventory);
router.put('/:id', updateInventory);

module.exports = router;
