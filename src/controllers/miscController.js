const Newsletter = require('../models/Newsletter');
const Contact = require('../models/Contact');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json(errorResponse('Email already subscribed'));
    await Newsletter.create({ email });
    res.status(201).json(successResponse(null, 'Subscribed successfully!'));
  } catch (error) {
    next(error);
  }
};

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    await Contact.create({ name, email, subject, message });
    res.status(201).json(successResponse(null, 'Message sent successfully! We will respond shortly.'));
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribeNewsletter, submitContact };
