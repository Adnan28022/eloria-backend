// Reusable email layout wrapper with inline CSS for cross-client compatibility
const generateEmailHTML = (content, previewText = '') => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://eloria-frontend.vercel.app';
  const logoUrl = `${frontendUrl}/logo-bg.png`; // Using public/logo-bg.png

  return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title></title>
      <!--[if mso]>
      <style>
        table {border-collapse:collapse;border-spacing:0;border:none;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
      </style>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        table, td, div, h1, p {font-family: Arial, sans-serif;}
        @media screen and (max-width: 530px) {
          .col-sml {max-width: 27% !important;}
          .col-lge {max-width: 73% !important;}
        }
      </style>
    </head>
    <body style="margin:0;padding:0;word-spacing:normal;background-color:#FBF3EC;">
      <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#FBF3EC;">
        
        <!-- Hidden Preview Text -->
        ${previewText ? `<div style="display:none;font-size:1px;color:#FBF3EC;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
        
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td align="center" style="padding:0;">
              <!--[if mso]>
              <table role="presentation" align="center" style="width:600px;">
              <tr>
              <td>
              <![endif]-->
              
              <!-- Main Container -->
              <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#3A322C;margin-top:40px;margin-bottom:40px;">
                
                <!-- Header -->
                <tr>
                  <td style="padding:30px;text-align:center;background-color:#ffffff;border-radius:16px 16px 0 0;border-bottom:1px solid #F4E4D7;">
                    <a href="${frontendUrl}" style="text-decoration:none;">
                      <img src="${logoUrl}" width="140" alt="Eloria Skincare" style="width:140px;max-width:100%;height:auto;border:none;text-decoration:none;color:#ffffff;">
                    </a>
                  </td>
                </tr>

                <!-- Dynamic Content Body -->
                <tr>
                  <td style="padding:40px 30px;background-color:#ffffff;">
                    ${content}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:30px;text-align:center;font-size:12px;background-color:#3A322C;color:#EDE5DA;border-radius:0 0 16px 16px;">
                    <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:16px;color:#F4E4D7;">Eloria Skincare</p>
                    <p style="margin:0 0 10px 0;color:#c0b4a9;">123 Botanical Avenue, Lahore, Pakistan</p>
                    <p style="margin:0 0 15px 0;">
                      <a href="${frontendUrl}" style="color:#C28E79;text-decoration:underline;">Visit Website</a> |
                      <a href="mailto:support@eloria.com" style="color:#C28E79;text-decoration:underline;">Support</a>
                    </p>
                    <p style="margin:0;font-size:10px;color:#887c73;">
                      You are receiving this email because you recently interacted with Eloria. 
                      If you have questions, please reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

// --- Reusable Content Blocks ---

const generateButton = (text, url) => `
  <table role="presentation" style="margin:30px auto;border:none;border-spacing:0;">
    <tr>
      <td align="center" style="border-radius:24px;background-color:#3A322C;">
        <a href="${url}" style="font-size:13px;font-family:Arial,sans-serif;text-decoration:none;line-height:normal;color:#ffffff;padding:12px 30px;display:inline-block;border-radius:24px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">${text}</a>
      </td>
    </tr>
  </table>
`;

const generateOrderTable = (items, subtotal, shipping, total) => {
  const formatPKR = (amount) => 'Rs ' + amount.toLocaleString('en-PK');
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:15px 0;border-bottom:1px solid #F4E4D7;">
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td style="width:70px;padding-right:15px;">
              <img src="${item.image || 'https://via.placeholder.com/60x80?text=Eloria'}" alt="${item.productName}" width="60" style="width:60px;height:80px;object-fit:cover;border-radius:8px;">
            </td>
            <td style="vertical-align:middle;">
              <h4 style="margin:0 0 5px 0;font-family:Georgia,serif;color:#3A322C;font-size:16px;">${item.productName}</h4>
              <p style="margin:0;font-size:13px;color:#7A6B61;">Qty: ${item.quantity}</p>
            </td>
            <td style="vertical-align:middle;text-align:right;font-weight:bold;color:#3A322C;">
              ${formatPKR(item.price * item.quantity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <table role="presentation" style="width:100%;border:none;border-spacing:0;margin-bottom:20px;">
      ${itemsHtml}
    </table>
    
    <table role="presentation" style="width:100%;border:none;border-spacing:0;background-color:#FBF3EC;border-radius:12px;padding:20px;">
      <tr>
        <td style="padding-bottom:10px;color:#7A6B61;font-size:14px;">Subtotal</td>
        <td style="padding-bottom:10px;text-align:right;color:#3A322C;">${formatPKR(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding-bottom:15px;color:#7A6B61;font-size:14px;border-bottom:1px solid #EEDCD0;">Shipping</td>
        <td style="padding-bottom:15px;text-align:right;color:#3A322C;border-bottom:1px solid #EEDCD0;">${formatPKR(shipping)}</td>
      </tr>
      <tr>
        <td style="padding-top:15px;color:#3A322C;font-size:18px;font-weight:bold;font-family:Georgia,serif;">Total</td>
        <td style="padding-top:15px;text-align:right;color:#3A322C;font-size:18px;font-weight:bold;font-family:Georgia,serif;">${formatPKR(total)}</td>
      </tr>
    </table>
  `;
};

// --- Specific Email Generators ---

const getWelcomeEmail = (name) => {
  const content = `
    <h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:24px;color:#3A322C;font-weight:normal;text-align:center;">Welcome to Eloria, ${name}</h1>
    <p style="margin:0 0 20px 0;color:#555;text-align:center;line-height:1.6;">We are delighted to have you join our community. Discover botanical skincare designed to nurture, balance, and restore your natural glow.</p>
    ${generateButton('Shop Collection', process.env.FRONTEND_URL + '/shop')}
  `;
  return generateEmailHTML(content, 'Welcome to the Eloria community.');
};

const getOrderConfirmationEmail = (order) => {
  const { customer, items, subtotal, shipping, total, orderId, shippingAddress } = order;
  
  const content = `
    <h1 style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:24px;color:#3A322C;font-weight:normal;">Thank you for your order, ${customer.name}</h1>
    <p style="margin:0 0 30px 0;color:#555;line-height:1.6;">Your botanical skincare ritual is being prepared. Here are the details of your order (<strong>#${orderId}</strong>).</p>
    
    ${generateOrderTable(items, subtotal, shipping, total)}
    
    <h3 style="margin:30px 0 10px 0;font-family:Georgia,serif;font-size:18px;color:#3A322C;font-weight:normal;">Shipping Address</h3>
    <p style="margin:0;color:#555;line-height:1.6;background-color:#Fcfcfc;padding:15px;border-radius:8px;border:1px solid #eee;">
      ${customer.name}<br/>
      ${shippingAddress.street}<br/>
      ${shippingAddress.city}, ${shippingAddress.zip}<br/>
      ${shippingAddress.country}<br/>
      ${customer.phone ? `Phone: ${customer.phone}` : ''}
    </p>
    
    ${generateButton('Track Order', process.env.FRONTEND_URL + '/admin/dashboard/orders')}
  `;
  return generateEmailHTML(content, `Order confirmation for #${orderId}`);
};

const getOrderStatusEmail = (name, orderId, status) => {
  let message = "";
  if (status === 'shipped') {
    message = "Good news! Your order has been shipped and is on its way to you.";
  } else if (status === 'delivered') {
    message = "Your order has been delivered. We hope you enjoy your new skincare ritual.";
  } else if (status === 'cancelled') {
    message = "Your order has been cancelled. If you have any questions, please contact our support team.";
  } else {
    message = \`Your order status has been updated to: \${status}\`;
  }

  const content = `
    <h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:24px;color:#3A322C;font-weight:normal;text-align:center;">Order Update</h1>
    <p style="margin:0 0 20px 0;color:#555;text-align:center;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 30px 0;color:#555;text-align:center;line-height:1.6;">${message} (Order <strong>#${orderId}</strong>)</p>
    ${generateButton('Visit Store', process.env.FRONTEND_URL)}
  `;
  return generateEmailHTML(content, `Update on your Eloria order #${orderId}`);
};

const getContactFormEmail = (name, email, subject, message) => {
  const content = `
    <h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:24px;color:#3A322C;font-weight:normal;">New Contact Form Message</h1>
    <table role="presentation" style="width:100%;border:none;border-spacing:0;background-color:#FBF3EC;border-radius:12px;padding:20px;margin-bottom:20px;">
      <tr><td style="padding-bottom:10px;"><strong>Name:</strong> ${name}</td></tr>
      <tr><td style="padding-bottom:10px;"><strong>Email:</strong> ${email}</td></tr>
      <tr><td style="padding-bottom:10px;"><strong>Subject:</strong> ${subject}</td></tr>
    </table>
    <h3 style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:18px;color:#3A322C;font-weight:normal;">Message:</h3>
    <p style="margin:0;color:#555;line-height:1.6;background-color:#Fcfcfc;padding:15px;border-radius:8px;border:1px solid #eee;">
      ${message.replace(/\\n/g, '<br/>')}
    </p>
  `;
  return generateEmailHTML(content, `New contact message from ${name}`);
};

module.exports = {
  generateEmailHTML,
  getWelcomeEmail,
  getOrderConfirmationEmail,
  getOrderStatusEmail,
  getContactFormEmail
};
