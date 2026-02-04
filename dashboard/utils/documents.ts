/**
 * Document generation utilities for orders
 * Generates: Invoice, Packing Slip, Delivery Note, Shipping Label, Dispatch Label
 */

export type DocumentType = 'invoice' | 'packing-slip' | 'delivery-note' | 'shipping-label' | 'dispatch-label';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  items: any[];
  customer: any;
  shippingAddress: any;
  billingAddress?: any;
  totalAmount: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  couponCode?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
};

const getBaseStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    padding: 40px;
    background: white;
    color: #333;
  }
  .document-container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #333;
  }
  .company-info h1 {
    color: rgb(237, 130, 79);
    font-size: 28px;
    margin-bottom: 8px;
  }
  .company-info p {
    color: #666;
    font-size: 13px;
    margin: 3px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  th {
    background-color: #f5f5f5;
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
    font-weight: bold;
    font-size: 13px;
  }
  td {
    padding: 10px;
    border: 1px solid #ddd;
    font-size: 13px;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .totals {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
  }
  .totals-table {
    width: 350px;
    border: 1px solid #ddd;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 15px;
    border-bottom: 1px solid #ddd;
  }
  .totals-row.total {
    background-color: #f5f5f5;
    font-weight: bold;
    font-size: 16px;
    border-bottom: none;
  }
  .footer {
    text-align: center;
    padding-top: 20px;
    border-top: 2px solid #ddd;
    color: #666;
    font-size: 12px;
  }
  @media print {
    body {
      padding: 0;
    }
    @page {
      margin: 1cm;
    }
  }
`;

export const generateInvoice = (order: Order) => {
  const customer = typeof order.customer === 'object' ? order.customer : { name: 'Unknown Customer' };
  const shippingAddress = order.shippingAddress || {};
  const billingAddress = order.billingAddress || shippingAddress;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber}</title>
    <style>${getBaseStyles()}</style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="company-info">
                <h1>TOBO DIGITAL</h1>
                <p>E-commerce Store</p>
                <p>Email: support@tobo.com</p>
                <p>Phone: +91 1234567890</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 24px; margin-bottom: 15px;">INVOICE</h2>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Invoice #:</strong> ${order.orderNumber}</p>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                ${order.trackingNumber ? `<p style="font-size: 13px; margin: 3px 0;"><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div>
                <h3 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">Bill To:</h3>
                <p style="font-size: 13px; margin: 3px 0;"><strong>${billingAddress.firstName || customer.name} ${billingAddress.lastName || ''}</strong></p>
                <p style="font-size: 13px; margin: 3px 0;">${billingAddress.street || ''}</p>
                <p style="font-size: 13px; margin: 3px 0;">${billingAddress.city || ''}, ${billingAddress.state || ''} ${billingAddress.zipCode || ''}</p>
                <p style="font-size: 13px; margin: 3px 0;">${billingAddress.country || 'India'}</p>
                ${billingAddress.phone ? `<p style="font-size: 13px; margin-top: 8px;">Phone: ${billingAddress.phone}</p>` : ''}
                ${billingAddress.email ? `<p style="font-size: 13px;">Email: ${billingAddress.email}</p>` : ''}
            </div>
            <div>
                <h3 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">Ship To:</h3>
                <p style="font-size: 13px; margin: 3px 0;"><strong>${shippingAddress.firstName || customer.name} ${shippingAddress.lastName || ''}</strong></p>
                <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.street || ''}</p>
                <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}</p>
                <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.country || 'India'}</p>
                ${shippingAddress.phone ? `<p style="font-size: 13px; margin-top: 8px;">Phone: ${shippingAddress.phone}</p>` : ''}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || []).map((item: any) => {
                  const product = typeof item.product === 'object' ? item.product : { itemName: item.itemName || 'Product', sku: item.sku || 'N/A' };
                  const price = item.price || item.yourPrice || 0;
                  const quantity = item.quantity || 1;
                  return `
                    <tr>
                        <td><strong>${product.itemName || 'Product'}</strong></td>
                        <td>${product.sku || item.sku || 'N/A'}</td>
                        <td class="text-center">${quantity}</td>
                        <td class="text-right">${formatPrice(price)}</td>
                        <td class="text-right"><strong>${formatPrice(price * quantity)}</strong></td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-table">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span><strong>${formatPrice(order.subtotal || order.totalAmount)}</strong></span>
                </div>
                ${(order.shipping || 0) > 0 ? `
                <div class="totals-row">
                    <span>Shipping:</span>
                    <span><strong>${formatPrice(order.shipping || 0)}</strong></span>
                </div>
                ` : ''}
                ${(order.tax || 0) > 0 ? `
                <div class="totals-row">
                    <span>Tax:</span>
                    <span><strong>${formatPrice(order.tax || 0)}</strong></span>
                </div>
                ` : ''}
                ${(order.discount || 0) > 0 ? `
                <div class="totals-row" style="color: green;">
                    <span>Discount:</span>
                    <span><strong>-${formatPrice(order.discount || 0)}</strong></span>
                </div>
                ` : ''}
                <div class="totals-row total">
                    <span>Total:</span>
                    <span>${formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 30px;">
            <h3 style="margin-bottom: 10px; font-size: 16px;">Payment Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
                <div>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                    <p><strong>Payment Status:</strong> <span style="color: green;">${(order.paymentStatus || 'pending').toUpperCase()}</span></p>
                </div>
                ${order.trackingNumber ? `
                <div>
                    <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 8px;"><strong>Thank you for your business!</strong></p>
            <p>For any queries, please contact us at support@tobo.com or +91 1234567890</p>
            <p style="margin-top: 12px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
</body>
</html>
  `;
  return html;
};

export const generatePackingSlip = (order: Order) => {
  const customer = typeof order.customer === 'object' ? order.customer : { name: 'Unknown Customer' };
  const shippingAddress = order.shippingAddress || {};
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Packing Slip - ${order.orderNumber}</title>
    <style>${getBaseStyles()}</style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="company-info">
                <h1>TOBO DIGITAL</h1>
                <p>E-commerce Store</p>
                <p>Email: support@tobo.com</p>
                <p>Phone: +91 1234567890</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 24px; margin-bottom: 15px;">PACKING SLIP</h2>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Order #:</strong> ${order.orderNumber}</p>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                ${order.trackingNumber ? `<p style="font-size: 13px; margin: 3px 0;"><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">Ship To:</h3>
            <p style="font-size: 13px; margin: 3px 0;"><strong>${shippingAddress.firstName || customer.name} ${shippingAddress.lastName || ''}</strong></p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.street || ''}</p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}</p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.country || 'India'}</p>
            ${shippingAddress.phone ? `<p style="font-size: 13px; margin-top: 8px;">Phone: ${shippingAddress.phone}</p>` : ''}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-center">Quantity</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || []).map((item: any) => {
                  const product = typeof item.product === 'object' ? item.product : { itemName: item.itemName || 'Product', sku: item.sku || 'N/A' };
                  const quantity = item.quantity || 1;
                  return `
                    <tr>
                        <td><strong>${product.itemName || 'Product'}</strong></td>
                        <td>${product.sku || item.sku || 'N/A'}</td>
                        <td class="text-center"><strong>${quantity}</strong></td>
                        <td>${product.description || product.shortDescription || '-'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
            <p style="font-size: 13px; margin: 5px 0;"><strong>Order Status:</strong> ${order.status.toUpperCase()}</p>
            <p style="font-size: 13px; margin: 5px 0;"><strong>Total Items:</strong> ${(order.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)}</p>
            ${order.trackingNumber ? `<p style="font-size: 13px; margin: 5px 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        </div>

        <div class="footer">
            <p style="margin-bottom: 8px;"><strong>Packing Slip</strong></p>
            <p>This packing slip lists the items included in your shipment.</p>
        </div>
    </div>
</body>
</html>
  `;
  return html;
};

export const generateDeliveryNote = (order: Order) => {
  const customer = typeof order.customer === 'object' ? order.customer : { name: 'Unknown Customer' };
  const shippingAddress = order.shippingAddress || {};
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Note - ${order.orderNumber}</title>
    <style>${getBaseStyles()}</style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="company-info">
                <h1>TOBO DIGITAL</h1>
                <p>E-commerce Store</p>
                <p>Email: support@tobo.com</p>
                <p>Phone: +91 1234567890</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 24px; margin-bottom: 15px;">DELIVERY NOTE</h2>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Order #:</strong> ${order.orderNumber}</p>
                <p style="font-size: 13px; margin: 3px 0;"><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                ${order.trackingNumber ? `<p style="font-size: 13px; margin: 3px 0;"><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">Delivery Address:</h3>
            <p style="font-size: 13px; margin: 3px 0;"><strong>${shippingAddress.firstName || customer.name} ${shippingAddress.lastName || ''}</strong></p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.street || ''}</p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}</p>
            <p style="font-size: 13px; margin: 3px 0;">${shippingAddress.country || 'India'}</p>
            ${shippingAddress.phone ? `<p style="font-size: 13px; margin-top: 8px;">Phone: ${shippingAddress.phone}</p>` : ''}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                </tr>
            </thead>
            <tbody>
                ${(order.items || []).map((item: any) => {
                  const product = typeof item.product === 'object' ? item.product : { itemName: item.itemName || 'Product', sku: item.sku || 'N/A' };
                  const price = item.price || item.yourPrice || 0;
                  const quantity = item.quantity || 1;
                  return `
                    <tr>
                        <td><strong>${product.itemName || 'Product'}</strong></td>
                        <td>${product.sku || item.sku || 'N/A'}</td>
                        <td class="text-center">${quantity}</td>
                        <td class="text-right">${formatPrice(price)}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <p style="font-size: 13px; margin: 5px 0;"><strong>Delivery Instructions:</strong></p>
            <p style="font-size: 13px; margin: 5px 0;">Please verify the items received and sign below.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 13px; margin: 5px 0;"><strong>Received By:</strong> _________________________</p>
                <p style="font-size: 13px; margin: 5px 0;"><strong>Date:</strong> _________________________</p>
                <p style="font-size: 13px; margin: 5px 0;"><strong>Signature:</strong> _________________________</p>
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 8px;"><strong>Delivery Note</strong></p>
            <p>This note confirms the delivery of goods listed above.</p>
        </div>
    </div>
</body>
</html>
  `;
  return html;
};

export const generateShippingLabel = (order: Order) => {
  const customer = typeof order.customer === 'object' ? order.customer : { name: 'Unknown Customer' };
  const shippingAddress = order.shippingAddress || {};
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Label - ${order.orderNumber}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background: white;
      }
      .label-container {
        width: 4in;
        height: 6in;
        border: 2px solid #000;
        padding: 15px;
        margin: 0 auto;
        background: white;
      }
      .label-header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .label-header h1 {
        font-size: 20px;
        color: rgb(237, 130, 79);
        margin-bottom: 5px;
      }
      .label-section {
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #ccc;
      }
      .label-section h3 {
        font-size: 12px;
        margin-bottom: 5px;
        text-transform: uppercase;
      }
      .label-section p {
        font-size: 11px;
        margin: 2px 0;
        line-height: 1.4;
      }
      .barcode-area {
        text-align: center;
        margin-top: 15px;
        padding: 10px;
        border: 1px dashed #000;
      }
      .barcode {
        font-family: monospace;
        font-size: 24px;
        letter-spacing: 2px;
      }
      @media print {
        body {
          padding: 0;
        }
        @page {
          size: 4in 6in;
          margin: 0;
        }
      }
    </style>
</head>
<body>
    <div class="label-container">
        <div class="label-header">
            <h1>TOBO DIGITAL</h1>
            <p style="font-size: 10px;">Shipping Label</p>
        </div>

        <div class="label-section">
            <h3>Ship To:</h3>
            <p><strong>${shippingAddress.firstName || customer.name} ${shippingAddress.lastName || ''}</strong></p>
            <p>${shippingAddress.street || ''}</p>
            <p>${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}</p>
            <p>${shippingAddress.country || 'India'}</p>
            ${shippingAddress.phone ? `<p><strong>Phone:</strong> ${shippingAddress.phone}</p>` : ''}
        </div>

        <div class="label-section">
            <h3>Order Information:</h3>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            ${order.trackingNumber ? `<p><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
            <p><strong>Items:</strong> ${(order.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)}</p>
        </div>

        <div class="label-section">
            <h3>From:</h3>
            <p><strong>TOBO DIGITAL</strong></p>
            <p>Warehouse Address</p>
            <p>India</p>
        </div>

        <div class="barcode-area">
            <div class="barcode">${order.orderNumber}</div>
            <p style="font-size: 9px; margin-top: 5px;">Scan for tracking</p>
        </div>
    </div>
</body>
</html>
  `;
  return html;
};

export const generateDispatchLabel = (order: Order) => {
  const customer = typeof order.customer === 'object' ? order.customer : { name: 'Unknown Customer' };
  const shippingAddress = order.shippingAddress || {};
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispatch Label - ${order.orderNumber}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background: white;
      }
      .label-container {
        width: 4in;
        height: 6in;
        border: 2px solid #000;
        padding: 15px;
        margin: 0 auto;
        background: white;
      }
      .label-header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .label-header h1 {
        font-size: 20px;
        color: rgb(237, 130, 79);
        margin-bottom: 5px;
      }
      .label-section {
        margin-bottom: 12px;
        padding: 8px;
        border: 1px solid #ccc;
      }
      .label-section h3 {
        font-size: 11px;
        margin-bottom: 4px;
        text-transform: uppercase;
        color: #666;
      }
      .label-section p {
        font-size: 10px;
        margin: 2px 0;
        line-height: 1.3;
      }
      .items-list {
        font-size: 9px;
        margin-top: 5px;
      }
      .barcode-area {
        text-align: center;
        margin-top: 12px;
        padding: 8px;
        border: 1px dashed #000;
      }
      .barcode {
        font-family: monospace;
        font-size: 22px;
        letter-spacing: 2px;
      }
      @media print {
        body {
          padding: 0;
        }
        @page {
          size: 4in 6in;
          margin: 0;
        }
      }
    </style>
</head>
<body>
    <div class="label-container">
        <div class="label-header">
            <h1>TOBO DIGITAL</h1>
            <p style="font-size: 10px;">Dispatch Label</p>
        </div>

        <div class="label-section">
            <h3>Dispatch To:</h3>
            <p><strong>${shippingAddress.firstName || customer.name} ${shippingAddress.lastName || ''}</strong></p>
            <p>${shippingAddress.street || ''}</p>
            <p>${shippingAddress.city || ''}, ${shippingAddress.state || ''}</p>
            <p>${shippingAddress.zipCode || ''} - ${shippingAddress.country || 'India'}</p>
            ${shippingAddress.phone ? `<p>📞 ${shippingAddress.phone}</p>` : ''}
        </div>

        <div class="label-section">
            <h3>Order Details:</h3>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Dispatch Date:</strong> ${formatDate(new Date().toISOString())}</p>
            ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
        </div>

        <div class="label-section">
            <h3>Items:</h3>
            <div class="items-list">
                ${(order.items || []).slice(0, 3).map((item: any) => {
                  const product = typeof item.product === 'object' ? item.product : { itemName: item.itemName || 'Product' };
                  const quantity = item.quantity || 1;
                  return `<p>• ${product.itemName || 'Product'} (Qty: ${quantity})</p>`;
                }).join('')}
                ${(order.items || []).length > 3 ? `<p>...and ${(order.items || []).length - 3} more item(s)</p>` : ''}
            </div>
        </div>

        <div class="barcode-area">
            <div class="barcode">${order.orderNumber}</div>
            <p style="font-size: 8px; margin-top: 4px;">Dispatch Reference</p>
        </div>
    </div>
</body>
</html>
  `;
  return html;
};

export const downloadDocument = (order: Order, documentType: DocumentType) => {
  let html = '';
  let filename = '';

  switch (documentType) {
    case 'invoice':
      html = generateInvoice(order);
      filename = `Invoice-${order.orderNumber}.html`;
      break;
    case 'packing-slip':
      html = generatePackingSlip(order);
      filename = `Packing-Slip-${order.orderNumber}.html`;
      break;
    case 'delivery-note':
      html = generateDeliveryNote(order);
      filename = `Delivery-Note-${order.orderNumber}.html`;
      break;
    case 'shipping-label':
      html = generateShippingLabel(order);
      filename = `Shipping-Label-${order.orderNumber}.html`;
      break;
    case 'dispatch-label':
      html = generateDispatchLabel(order);
      filename = `Dispatch-Label-${order.orderNumber}.html`;
      break;
    default:
      return;
  }

  // Create a new window for preview
  const docWindow = window.open('', '_blank');
  if (!docWindow) {
    alert('Please allow popups to download the document');
    return;
  }

  docWindow.document.write(html);
  docWindow.document.close();

  // Also download the file
  setTimeout(() => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
};

export const printDocument = (order: Order, documentType: DocumentType) => {
  downloadDocument(order, documentType);
};

