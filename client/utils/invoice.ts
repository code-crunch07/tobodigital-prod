/**
 * Utility functions for invoice generation and download
 */

export const downloadInvoice = (order: any) => {
  // Create a new window with invoice content
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) {
    alert('Please allow popups to download the invoice');
    return;
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

  const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
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
        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .company-info h1 {
            color: rgb(237, 130, 79);
            font-size: 32px;
            margin-bottom: 10px;
        }
        .company-info p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h2 {
            font-size: 28px;
            margin-bottom: 20px;
        }
        .invoice-title p {
            font-size: 14px;
            margin: 5px 0;
        }
        .address-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .address-box h3 {
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        .address-box p {
            font-size: 14px;
            margin: 5px 0;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        th {
            background-color: #f5f5f5;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        }
        td {
            padding: 12px;
            border: 1px solid #ddd;
        }
        .item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 10px;
        }
        .item-cell {
            display: flex;
            align-items: center;
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
            margin-bottom: 40px;
        }
        .totals-table {
            width: 350px;
            border: 1px solid #ddd;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
        }
        .totals-row.total {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 18px;
            border-bottom: none;
        }
        .payment-info {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 40px;
        }
        .payment-info h3 {
            margin-bottom: 15px;
            font-size: 18px;
        }
        .payment-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        @media print {
            body {
                padding: 0;
            }
            .invoice-container {
                max-width: 100%;
            }
            @page {
                margin: 1cm;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <h1>TOBO DIGITAL</h1>
                <p>E-commerce Store</p>
                <p>Email: support@tobo.com</p>
                <p>Phone: +91 1234567890</p>
            </div>
            <div class="invoice-title">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
                <p><strong>Date:</strong> ${formatDate(order.date)}</p>
                ${order.trackingNumber ? `<p><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
        </div>

        <div class="address-section">
            <div class="address-box">
                <h3>Bill To:</h3>
                <p><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
                <p>${order.shippingAddress.street}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p>${order.shippingAddress.country}</p>
                <p style="margin-top: 10px;">Phone: ${order.shippingAddress.phone}</p>
                <p>Email: ${order.shippingAddress.email}</p>
            </div>
            <div class="address-box">
                <h3>Ship To:</h3>
                <p><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
                <p>${order.shippingAddress.street}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p>${order.shippingAddress.country}</p>
                <p style="margin-top: 10px;">Phone: ${order.shippingAddress.phone}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map((item: any) => `
                    <tr>
                        <td>
                            <div class="item-cell">
                                <strong>${item.itemName}</strong>
                            </div>
                        </td>
                        <td>${item.sku || 'N/A'}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatPrice(item.yourPrice)}</td>
                        <td class="text-right"><strong>${formatPrice(item.yourPrice * item.quantity)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-table">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span><strong>${formatPrice(order.subtotal)}</strong></span>
                </div>
                ${order.shipping > 0 ? `
                <div class="totals-row">
                    <span>Shipping:</span>
                    <span><strong>${formatPrice(order.shipping)}</strong></span>
                </div>
                ` : ''}
                ${order.tax > 0 ? `
                <div class="totals-row">
                    <span>Tax:</span>
                    <span><strong>${formatPrice(order.tax)}</strong></span>
                </div>
                ` : ''}
                ${order.discount > 0 ? `
                <div class="totals-row" style="color: green;">
                    <span>Discount:</span>
                    <span><strong>-${formatPrice(order.discount)}</strong></span>
                </div>
                ` : ''}
                <div class="totals-row total">
                    <span>Total:</span>
                    <span>${formatPrice(order.total)}</span>
                </div>
            </div>
        </div>

        <div class="payment-info">
            <h3>Payment Information</h3>
            <div class="payment-details">
                <div>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> <span style="color: green;">${order.paymentStatus.toUpperCase()}</span></p>
                </div>
                ${order.trackingNumber ? `
                <div>
                    <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                    ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>` : ''}
                </div>
                ` : ''}
            </div>
        </div>

        <div class="footer">
            <p style="margin-bottom: 10px;"><strong>Thank you for your business!</strong></p>
            <p>For any queries, please contact us at support@tobo.com or +91 1234567890</p>
            <p style="margin-top: 15px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
  `;

  invoiceWindow.document.write(invoiceHTML);
  invoiceWindow.document.close();

  // Also provide a download option
  setTimeout(() => {
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
};

export const printInvoice = (order: any) => {
  downloadInvoice(order);
};

