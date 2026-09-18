const express = require('express');
const router = express.Router();
const { subscribeNewsletter, submitContact } = require('../controllers/miscController');

router.post('/newsletter', subscribeNewsletter);
router.post('/contact', submitContact);

module.exports = router;
