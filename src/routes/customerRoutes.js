const express = require('express');
const router = express.Router();
const { getCustomers, deleteCustomer } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getCustomers);
router.delete('/:id', deleteCustomer);

module.exports = router;
