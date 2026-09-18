const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const sendOrderConfirmationEmail = async (order) => {
  const { customer, items, subtotal, shipping, total, orderId, shippingAddress } = order;

  // Format currency
  const formatPKR = (amount) => `Rs ${amount.toLocaleString('en-PK')}`;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${item.image || 'https://via.placeholder.com/60x80'}" alt="${item.productName}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px;" />
          <div>
            <h4 style="margin: 0; font-family: serif; color: #333; font-size: 16px;">${item.productName}</h4>
            <p style="margin: 5px 0 0; font-size: 12px; color: #777;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; color: #333; font-weight: bold;">
        ${formatPKR(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Eloria Order Confirmation</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf9; padding: 40px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background-color: #1C1C1C; padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; font-family: serif; font-size: 32px; margin: 0; letter-spacing: 2px; font-weight: normal; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; color: #333; font-family: serif; margin-bottom: 10px; }
        .message { color: #666; line-height: 1.6; font-size: 14px; margin-bottom: 30px; font-weight: 300; }
        .order-details { background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
        .order-details p { margin: 5px 0; font-size: 13px; color: #555; }
        .table-container { margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; }
        .summary { border-top: 2px solid #eee; padding-top: 20px; margin-top: 20px; }
        .footer { text-align: center; padding: 30px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
        .address-box { border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #555; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.FRONTEND_URL || 'http://localhost:3000'}/eloria-logo.png" alt="Eloria Skincare" style="height: 50px; object-fit: contain;" />
        </div>
        <div class="content">
          <h2 class="greeting">Hello ${customer.name},</h2>
          <p class="message">Thank you for choosing Eloria. Your botanical skincare ritual is being prepared. Below are the details of your order.</p>
          
          <div class="order-details">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          </div>

          <div class="table-container">
            <table>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #555; font-size: 14px;">
              <span>Subtotal</span>
              <span>${formatPKR(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #555; font-size: 14px;">
              <span>Shipping</span>
              <span>${formatPKR(shipping)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; color: #333; font-size: 20px; font-weight: bold; font-family: serif;">
              <span>Total</span>
              <span>${formatPKR(total)}</span>
            </div>
          </div>

          <div class="address-box">
            <strong style="display: block; margin-bottom: 5px; color: #333;">Shipping Address:</strong>
            ${customer.name}<br/>
            ${shippingAddress.street}<br/>
            ${shippingAddress.city}, ${shippingAddress.zip}<br/>
            ${shippingAddress.country}<br/>
            ${customer.phone ? `Phone: ${customer.phone}` : ''}
          </div>
        </div>
        <div class="footer">
          <p>Eloria Skincare | Lahore, Pakistan</p>
          <p>If you have any questions, reply to this email or contact our concierge.</p>
        </div>
      </div>
    </body>
    </body>
    </html>
  `;

  // The host's real email is SMTP_EMAIL (madnanansari43@gmail.com)
  // ADMIN_EMAIL is just used for logging into the dashboard
  const hostEmail = process.env.SMTP_EMAIL;

  const mailOptions = {
    from: '"Eloria Skincare" <madnanansari43@gmail.com>',
    to: `${customer.email}, ${hostEmail}`,
    subject: `Your Eloria Order Confirmation (#${orderId})`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
