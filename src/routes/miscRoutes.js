const express = require('express');
const router = express.Router();
const { subscribeNewsletter, submitContact, testEmailTemplates } = require('../controllers/miscController');

router.post('/newsletter', subscribeNewsletter);
router.post('/contact', submitContact);
router.post('/test-emails', testEmailTemplates);

module.exports = router;
