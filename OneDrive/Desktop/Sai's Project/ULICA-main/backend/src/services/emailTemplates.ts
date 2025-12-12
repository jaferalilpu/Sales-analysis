/**
 * Email Templates for ULICA
 * Professional HTML email templates for transactional emails
 */

export interface OrderItem {
  productTitle: string;
  variantTitle: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderDetails {
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
  trackingUrl?: string;
  awbNumber?: string;
}

/**
 * Base email wrapper with ULICA branding
 */
function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ULICA</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #000000;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 12px;
      border-top: 1px solid #eeeeee;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #333333;
    }
    .divider {
      border-top: 1px solid #eeeeee;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>ULICA</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>ULICA</strong> - Streetwear Redefined
      </p>
      <p style="margin: 0 0 10px 0;">
        Follow us on social media for the latest drops and exclusive offers
      </p>
      <p style="margin: 0; color: #999999;">
        &copy; ${new Date().getFullYear()} ULICA. All rights reserved.
      </p>
      <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailTemplate(userName: string): string {
  const content = `
    <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Welcome to ULICA, ${userName}!</h2>
    
    <p style="color: #333333; font-size: 16px;">
      Thank you for joining the ULICA community! We're excited to have you on board.
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      As a member, you'll get:
    </p>
    
    <ul style="color: #333333; font-size: 16px; padding-left: 20px;">
      <li>Exclusive access to limited edition drops</li>
      <li>Early access to new collections</li>
      <li>Special discounts and rewards</li>
      <li>Priority customer support</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env['FRONTEND_URL'] || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app'}" class="button">
        Start Shopping
      </a>
    </div>
    
    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
      If you have any questions, feel free to reach out to our support team. We're here to help!
    </p>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Order Confirmation Email Template
 */
export function getOrderConfirmationEmailTemplate(orderDetails: OrderDetails, userName: string): string {
  const itemsHtml = orderDetails.items.map(item => `
    <tr style="border-bottom: 1px solid #eeeeee;">
      <td style="padding: 15px 0;">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.productTitle}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 15px; vertical-align: middle;">` : ''}
        <div style="display: inline-block; vertical-align: middle;">
          <p style="margin: 0; font-weight: 600; color: #000000;">${item.productTitle}</p>
          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">${item.variantTitle}</p>
        </div>
      </td>
      <td style="padding: 15px 0; text-align: center; color: #333333;">${item.quantity}</td>
      <td style="padding: 15px 0; text-align: right; color: #000000; font-weight: 600;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const content = `
    <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Order Confirmed!</h2>
    
    <p style="color: #333333; font-size: 16px;">
      Hi ${userName},
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      Thank you for your order! We've received your order and are preparing it for shipment.
    </p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #000000; font-weight: 600;">Order Number: <span style="color: #666666; font-weight: normal;">${orderDetails.orderNumber}</span></p>
      <p style="margin: 0; color: #000000; font-weight: 600;">Order Date: <span style="color: #666666; font-weight: normal;">${orderDetails.orderDate}</span></p>
    </div>
    
    <h3 style="color: #000000; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Order Details</h3>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="border-bottom: 2px solid #000000;">
          <th style="text-align: left; padding: 10px 0; color: #000000; font-weight: 600;">Item</th>
          <th style="text-align: center; padding: 10px 0; color: #000000; font-weight: 600;">Qty</th>
          <th style="text-align: right; padding: 10px 0; color: #000000; font-weight: 600;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 5px 0; color: #666666;">Subtotal:</td>
          <td style="text-align: right; padding: 5px 0; color: #000000; font-weight: 600;">₹${orderDetails.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${orderDetails.discount ? `
        <tr>
          <td style="padding: 5px 0; color: #666666;">Discount:</td>
          <td style="text-align: right; padding: 5px 0; color: #28a745; font-weight: 600;">-₹${orderDetails.discount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 5px 0; color: #666666;">Shipping:</td>
          <td style="text-align: right; padding: 5px 0; color: #000000; font-weight: 600;">₹${orderDetails.shipping.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-top: 2px solid #000000; margin-top: 10px;">
          <td style="padding: 10px 0 5px 0; color: #000000; font-weight: 600; font-size: 18px;">Total:</td>
          <td style="text-align: right; padding: 10px 0 5px 0; color: #000000; font-weight: 600; font-size: 18px;">₹${orderDetails.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #000000; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Shipping Address</h3>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 5px 0; color: #000000; font-weight: 600;">${orderDetails.shippingAddress.name}</p>
      <p style="margin: 0 0 5px 0; color: #666666;">${orderDetails.shippingAddress.address}</p>
      <p style="margin: 0 0 5px 0; color: #666666;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.pincode}</p>
      <p style="margin: 0; color: #666666;">Phone: ${orderDetails.shippingAddress.phone}</p>
    </div>
    
    <p style="color: #666666; font-size: 14px; margin-top: 20px;">
      <strong>Payment Method:</strong> ${orderDetails.paymentMethod}
    </p>
    
    ${orderDetails.trackingUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${orderDetails.trackingUrl}" class="button">
        Track Your Order
      </a>
    </div>
    ` : ''}
    
    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
      We'll send you another email when your order ships. If you have any questions, please contact our support team.
    </p>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Order Shipped Email Template
 */
export function getOrderShippedEmailTemplate(orderNumber: string, trackingUrl: string, awbNumber: string, userName: string): string {
  const content = `
    <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Your Order Has Shipped! 🚀</h2>
    
    <p style="color: #333333; font-size: 16px;">
      Hi ${userName},
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.
    </p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #000000; font-weight: 600;">AWB Number: <span style="color: #666666; font-weight: normal;">${awbNumber}</span></p>
      <p style="margin: 0; color: #666666; font-size: 14px;">You can track your shipment using the AWB number above.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" class="button">
        Track Your Order
      </a>
    </div>
    
    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
      Your order should arrive within 3-5 business days. We'll notify you once it's delivered!
    </p>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Order Delivered Email Template
 */
export function getOrderDeliveredEmailTemplate(orderNumber: string, userName: string): string {
  const content = `
    <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Your Order Has Been Delivered! ✅</h2>
    
    <p style="color: #333333; font-size: 16px;">
      Hi ${userName},
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      Your order <strong>${orderNumber}</strong> has been successfully delivered!
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      We hope you love your new ULICA gear! If you have any questions or need assistance, we're here to help.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/dashboard" class="button">
        View Order Details
      </a>
    </div>
    
    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
      We'd love to hear your feedback! Consider leaving a review to help other customers.
    </p>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Password Reset Email Template
 */
export function getPasswordResetEmailTemplate(userName: string, resetLink: string): string {
  const content = `
    <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Reset Your Password</h2>
    
    <p style="color: #333333; font-size: 16px;">
      Hi ${userName},
    </p>
    
    <p style="color: #333333; font-size: 16px;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    </p>
    
    <p style="color: #999999; font-size: 12px; margin-top: 20px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" style="color: #666666; word-break: break-all;">${resetLink}</a>
    </p>
  `;
  
  return getEmailWrapper(content);
}

