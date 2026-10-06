const Newsletter = require('../models/Newsletter');
const Contact = require('../models/Contact');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendWelcomeEmail, sendContactFormEmail } = require('../utils/mailService');

const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json(errorResponse('Email already subscribed'));
    await Newsletter.create({ email });
    
    try {
      await sendWelcomeEmail('Subscriber', email);
    } catch (e) { console.error('Welcome email error:', e); }

    res.status(201).json(successResponse(null, 'Subscribed successfully!'));
  } catch (error) {
    next(error);
  }
};

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    await Contact.create({ name, email, subject, message });

    try {
      await sendContactFormEmail(name, email, subject, message);
    } catch (e) { console.error('Contact form email error:', e); }

    res.status(201).json(successResponse(null, 'Message sent successfully! We will respond shortly.'));
  } catch (error) {
    next(error);
  }
};

const testEmailTemplates = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(errorResponse('Email is required'));

    // Test Welcome
    await sendWelcomeEmail('Test User', email);

    // Test Order Confirmation
    const sampleOrder = {
      orderId: 'TEST-12345',
      customer: { name: 'Test User', email },
      shippingAddress: { street: '123 Test St', city: 'Test City', zip: '12345', country: 'Testland', phone: '123456789' },
      items: [
        { productName: 'Hydra-Foam Cleanser', quantity: 2, price: 3500, image: 'https://eloria-frontend.vercel.app/bubble-1.png' }
      ],
      subtotal: 7000,
      shipping: 200,
      total: 7200
    };
    await require('../utils/mailService').sendOrderConfirmationEmail(sampleOrder);

    // Test Order Status
    await require('../utils/mailService').sendOrderStatusEmail('Test User', email, 'TEST-12345', 'shipped');

    res.json(successResponse(null, 'Test emails sent successfully!'));
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribeNewsletter, submitContact, testEmailTemplates };
