const nodemailer = require('nodemailer');
const { getWelcomeEmail, getOrderConfirmationEmail, getOrderStatusEmail, getContactFormEmail } = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOrderConfirmationEmail = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Eloria Skincare" <hello@eloria.com>',
    to: `${order.customer.email}, ${adminEmail}`,
    subject: `Your Eloria Order Confirmation (#${order.orderId})`,
    html: getOrderConfirmationEmail(order),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
};

const sendOrderStatusEmail = async (name, email, orderId, status) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Eloria Skincare" <hello@eloria.com>',
    to: email,
    subject: `Your Eloria Order Status: ${status.toUpperCase()} (#${orderId})`,
    html: getOrderStatusEmail(name, orderId, status),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
};

const sendWelcomeEmail = async (name, email) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Eloria Skincare" <hello@eloria.com>',
    to: email,
    subject: `Welcome to Eloria Skincare`,
    html: getWelcomeEmail(name),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const sendContactFormEmail = async (name, email, subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Eloria Skincare" <hello@eloria.com>',
    to: adminEmail,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: getContactFormEmail(name, email, subject, message),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendWelcomeEmail,
  sendContactFormEmail
};
