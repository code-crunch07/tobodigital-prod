import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Order from '../models/Order';
import User from '../models/User';
import { createOrderNotification, createPaymentNotification } from './notifications';
import { sendEmail } from '../services/email';
import { generateInvoicePdf } from '../services/invoice';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// ─── Email helpers ────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function buildItemsTable(items: any[]) {
  return items
    .map((i: any) => {
      const name = i.product?.itemName || i.product?.name || 'Product';
      return `  • ${name} × ${i.quantity}  —  ${formatCurrency(i.price * i.quantity)}`;
    })
    .join('\n');
}

function buildItemsHtml(items: any[]) {
  const rows = items
    .map((i: any) => {
      const name = i.product?.itemName || i.product?.name || 'Product';
      return `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${formatCurrency(i.price * i.quantity)}</td>
      </tr>`;
    })
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="background:#f9f9f9">
      <th style="padding:8px 12px;text-align:left">Item</th>
      <th style="padding:8px 12px;text-align:center">Qty</th>
      <th style="padding:8px 12px;text-align:right">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────

const generateOrderNumber = (): string => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      customer,
      search,
    } = req.query;

    const query: any = {};
    const reqUser = (req as any).user;

    if (reqUser && reqUser.role === 'customer') {
      query.customer = reqUser.userId;
    } else if (customer) {
      query.customer = customer;
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const orConditions: any[] = [{ orderNumber: searchRegex }];
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      })
        .select('_id')
        .lean();
      if (matchingUsers.length > 0) {
        orConditions.push({ customer: { $in: matchingUsers.map((u) => u._id) } });
      }
      query.$or = orConditions;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'itemName mainImage yourPrice')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalOrders: total,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const reqUser = (req as any).user;
    if (reqUser && reqUser.role === 'customer') {
      const orderCustomerId = (order.customer as any)?._id?.toString() ?? (order.customer as any)?.toString();
      if (orderCustomerId !== reqUser.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, items, shippingAddress, billingAddress, companyName, gstNumber, paymentMethod, paymentStatus } = req.body;

    if (!customer || !items || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Customer, items, and shipping address are required',
      });
    }

    // Resolve customer: can be an ObjectId string (dashboard) or a guest object from checkout
    let customerId: string | null = null;

    if (typeof customer === 'string') {
      // Already an id from dashboard/admin
      customerId = customer;
    } else if (typeof customer === 'object' && customer !== null) {
      const email = (customer.email || '').toLowerCase().trim();
      const name =
        (customer.firstName && customer.lastName)
          ? `${customer.firstName} ${customer.lastName}`
          : (customer.name || '').trim();
      const phone = (customer.phone || '').toString().trim();

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: 'Customer name and email are required',
        });
      }

      // Find or create a lightweight customer user for guest checkout
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name,
          email,
          ...(phone && { phone }),
          // Random password since this is a guest-order user; can be reset via forgot-password
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
          role: 'customer',
        });
        await user.save();
      }
      customerId = String(user._id);
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to resolve customer for order',
      });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }

    const orderData: any = {
      orderNumber: generateOrderNumber(),
      customer: customerId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    };

    if (paymentStatus) {
      orderData.paymentStatus = paymentStatus;
    }
    if (billingAddress && typeof billingAddress === 'object') {
      orderData.billingAddress = billingAddress;
    }
    if (companyName != null && String(companyName).trim()) {
      orderData.companyName = String(companyName).trim();
    }
    if (gstNumber != null && String(gstNumber).trim()) {
      orderData.gstNumber = String(gstNumber).trim();
    }

    const order = new Order(orderData);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product');

    // Create notification for new order
    await createOrderNotification(String(order._id));

    // Send order confirmation email to customer (best-effort)
    try {
      const customerDoc = populatedOrder?.customer as any;
      const toEmail = customerDoc?.email;
      const siteName = process.env.SITE_NAME || 'Tobo Digital';
      const orderNumber = populatedOrder?.orderNumber || String(populatedOrder?._id);
      const total = populatedOrder?.totalAmount ?? totalAmount;
      const shipping = populatedOrder?.shippingAddress as any;
      const shippingLine = shipping
        ? [shipping.street, shipping.city, shipping.state, shipping.zipCode, shipping.country]
            .filter(Boolean)
            .join(', ')
        : '';
      const orderItems = (populatedOrder?.items as any[]) || [];

      // ── Generate PDF invoice ───────────────────────────────────────────────
      let invoicePdf: Buffer | null = null;
      try {
        invoicePdf = await generateInvoicePdf({
          orderNumber: String(orderNumber),
          orderDate: populatedOrder?.createdAt ? new Date(populatedOrder.createdAt as any) : new Date(),
          customerName: customerDoc?.name || 'Customer',
          customerEmail: toEmail || '',
          shippingAddress: shipping || { street: '', city: '', state: '', zipCode: '', country: '' },
          billingAddress: (populatedOrder as any)?.billingAddress || undefined,
          companyName: (populatedOrder as any)?.companyName || undefined,
          gstNumber: (populatedOrder as any)?.gstNumber || undefined,
          items: orderItems.map((i: any) => ({
            name: i.product?.itemName || i.product?.name || 'Product',
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: total,
          paymentMethod: (populatedOrder as any)?.paymentMethod || 'Online',
          paymentStatus: (populatedOrder as any)?.paymentStatus || 'paid',
        });
      } catch (pdfErr) {
        console.error('Invoice PDF generation error:', (pdfErr as any)?.message || pdfErr);
      }

      // ── Customer confirmation ──────────────────────────────────────────────
      if (toEmail) {
        const attachments = invoicePdf
          ? [{ filename: `Invoice-${orderNumber}.pdf`, content: invoicePdf, contentType: 'application/pdf' }]
          : [];

        await sendEmail({
          to: toEmail,
          subject: `Order Confirmed — ${orderNumber} | ${siteName}`,
          text: [
            `Hi ${customerDoc?.name || 'there'},`,
            '',
            `Thank you for your order at ${siteName}!`,
            '',
            `Order number : ${orderNumber}`,
            `Total        : ${formatCurrency(total)}`,
            shippingLine ? `Ship to      : ${shippingLine}` : '',
            '',
            orderItems.length ? 'Items:\n' + buildItemsTable(orderItems) : '',
            '',
            'Your invoice is attached as a PDF. We will email you again once your order ships.',
            '',
            `— ${siteName} team`,
          ]
            .filter((l) => l !== undefined)
            .join('\n'),
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:rgb(22,176,238);padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:22px">${siteName}</h1>
  </div>
  <div style="padding:28px 32px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="margin-top:0;font-size:18px;color:#111">Order Confirmed ✓</h2>
    <p>Hi <strong>${customerDoc?.name || 'there'}</strong>, thanks for shopping with us!</p>
    <table style="width:100%;margin:16px 0;font-size:14px">
      <tr><td style="color:#666;padding:4px 0">Order Number</td><td style="font-weight:600">${orderNumber}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Total</td><td style="font-weight:600;color:rgb(22,176,238)">${formatCurrency(total)}</td></tr>
      ${shippingLine ? `<tr><td style="color:#666;padding:4px 0">Ship To</td><td>${shippingLine}</td></tr>` : ''}
    </table>
    ${orderItems.length ? `<h3 style="font-size:14px;color:#444;margin-bottom:8px">Items Ordered</h3>${buildItemsHtml(orderItems)}` : ''}
    <div style="margin-top:20px;padding:12px 16px;background:#f0fbff;border-left:4px solid rgb(22,176,238);border-radius:4px;font-size:13px;color:#0a6a8a">
      📎 Your tax invoice is attached to this email as a PDF.
    </div>
    <p style="margin-top:16px;font-size:13px;color:#888">We will send you another email once your order ships. If you have questions, just reply to this email.</p>
  </div>
</div>`,
          attachments,
        });
      }

      // ── Admin notification ─────────────────────────────────────────────────
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `🛒 New Order ${orderNumber} — ${formatCurrency(total)}`,
          text: [
            `New order received on ${siteName}.`,
            '',
            `Order   : ${orderNumber}`,
            `Customer: ${customerDoc?.name || 'Guest'} <${toEmail || 'N/A'}>`,
            `Total   : ${formatCurrency(total)}`,
            shippingLine ? `Ship to : ${shippingLine}` : '',
            '',
            orderItems.length ? 'Items:\n' + buildItemsTable(orderItems) : '',
          ]
            .filter((l) => l !== undefined)
            .join('\n'),
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#1a1a2e;padding:20px 28px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:18px">New Order — ${siteName} Dashboard</h1>
  </div>
  <div style="padding:24px 28px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;font-size:14px;margin-bottom:16px">
      <tr><td style="color:#666;padding:4px 0;width:120px">Order</td><td style="font-weight:700">${orderNumber}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Customer</td><td>${customerDoc?.name || 'Guest'}${toEmail ? ` &lt;${toEmail}&gt;` : ''}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Total</td><td style="font-weight:700;color:rgb(22,176,238)">${formatCurrency(total)}</td></tr>
      ${shippingLine ? `<tr><td style="color:#666;padding:4px 0">Ship To</td><td>${shippingLine}</td></tr>` : ''}
    </table>
    ${orderItems.length ? buildItemsHtml(orderItems) : ''}
  </div>
</div>`,
        });
      }
    } catch (err) {
      console.error('Order confirmation email error:', (err as any)?.message || err);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;

    // Recalculate total if items are updated
    if (updateData.items) {
      let totalAmount = 0;
      for (const item of updateData.items) {
        totalAmount += item.price * item.quantity;
      }
      updateData.totalAmount = totalAmount;
    }

    // Get old order to check payment status change
    const oldOrder = await Order.findById(orderId);
    
    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('customer', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Create notification if payment status changed to 'paid'
    if (oldOrder && oldOrder.paymentStatus !== 'paid' && order.paymentStatus === 'paid') {
      await createPaymentNotification(orderId);
    }

    // ── Status-change emails ────────────────────────────────────────────────
    if (oldOrder && oldOrder.status !== order.status) {
      try {
        const customerDoc = order.customer as any;
        const toEmail = customerDoc?.email;
        if (toEmail) {
          const siteName = process.env.SITE_NAME || 'Tobo Digital';
          const orderNumber = order.orderNumber || String(order._id);
          const total = order.totalAmount;
          const orderItems = (order.items as any[]) || [];
          const newStatus = order.status;

          const statusMessages: Record<string, { subject: string; heading: string; body: string; emoji: string }> = {
            processing: {
              emoji: '⚙️',
              subject: `Your order ${orderNumber} is being processed`,
              heading: 'We\'re processing your order',
              body: 'Good news! Your order has been confirmed and is now being prepared.',
            },
            shipped: {
              emoji: '🚚',
              subject: `Your order ${orderNumber} has shipped!`,
              heading: 'Your order is on its way',
              body: `Your order has been shipped${order.courierName ? ` via <strong>${order.courierName}</strong>` : ''}.${order.trackingNumber ? ` Tracking ID: <strong>${order.trackingNumber}</strong>` : ''}`,
            },
            delivered: {
              emoji: '📦',
              subject: `Your order ${orderNumber} has been delivered`,
              heading: 'Order Delivered!',
              body: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
            },
            cancelled: {
              emoji: '❌',
              subject: `Your order ${orderNumber} has been cancelled`,
              heading: 'Order Cancelled',
              body: 'Your order has been cancelled. If you have any questions, please contact our support team.',
            },
          };

          const msg = statusMessages[newStatus];
          if (msg) {
            await sendEmail({
              to: toEmail,
              subject: `${msg.emoji} ${msg.subject} | ${siteName}`,
              text: [
                `Hi ${customerDoc?.name || 'there'},`,
                '',
                msg.body.replace(/<[^>]*>/g, ''),
                '',
                `Order number : ${orderNumber}`,
                `Total        : ${formatCurrency(total)}`,
                order.trackingUrl ? `Track order  : ${order.trackingUrl}` : '',
                '',
                `— ${siteName} team`,
              ].filter(Boolean).join('\n'),
              html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:rgb(22,176,238);padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:20px">${siteName}</h1>
  </div>
  <div style="padding:28px 32px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="margin-top:0;font-size:18px">${msg.emoji} ${msg.heading}</h2>
    <p>Hi <strong>${customerDoc?.name || 'there'}</strong>,</p>
    <p>${msg.body}</p>
    <table style="width:100%;font-size:14px;margin:16px 0">
      <tr><td style="color:#666;padding:4px 0;width:140px">Order Number</td><td style="font-weight:600">${orderNumber}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Total</td><td style="font-weight:600;color:rgb(22,176,238)">${formatCurrency(total)}</td></tr>
      ${order.trackingNumber ? `<tr><td style="color:#666;padding:4px 0">Tracking ID</td><td>${order.trackingNumber}</td></tr>` : ''}
    </table>
    ${orderItems.length ? buildItemsHtml(orderItems) : ''}
    ${order.trackingUrl ? `<p style="margin-top:20px"><a href="${order.trackingUrl}" style="background:rgb(22,176,238);color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600">Track Your Order</a></p>` : ''}
    <p style="font-size:13px;color:#888;margin-top:20px">If you have questions, just reply to this email.</p>
  </div>
</div>`,
            });
          }
        }
      } catch (err) {
        console.error('Status change email error:', (err as any)?.message || err);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
    }
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount (in paise) is required',
      });
    }
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64'),
      },
      body: JSON.stringify({
        amount: Number(amount),
        currency: currency.toString(),
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });
    const data = await response.json() as {
      error?: { description?: string };
      id?: string;
      amount?: number;
      currency?: string;
    };
    if (data.error) {
      return res.status(400).json({
        success: false,
        message: data.error.description || 'Razorpay order creation failed',
      });
    }
    res.json({
      success: true,
      data: {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create payment order',
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured.',
      });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const verified = expected === razorpay_signature;
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Verification failed',
    });
  }
};

const getOrderTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reqUser = (req as any).user;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (reqUser?.role === 'customer' && order.customer.toString() !== reqUser._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!order.awbNumber) {
      return res.json({
        success: true,
        tracking: null,
        message: 'Tracking information not yet available. Your order is being prepared.',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          trackingNumber: order.trackingNumber,
          courierName: order.courierName,
          estimatedDelivery: order.estimatedDelivery,
          trackingUrl: order.trackingUrl,
        },
      });
    }

    const axios = (await import('axios')).default;
    const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) {
      return res.json({
        success: true,
        tracking: null,
        message: 'Tracking service unavailable',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          trackingNumber: order.trackingNumber,
          courierName: order.courierName,
          estimatedDelivery: order.estimatedDelivery,
          trackingUrl: order.trackingUrl,
        },
      });
    }

    const { getAuthToken } = await import('./shiprocket');
    const token = await getAuthToken();

    const trackingResponse = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${order.awbNumber}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const trackingData = trackingResponse.data?.tracking_data;

    return res.json({
      success: true,
      tracking: {
        current_status: trackingData?.shipment_track?.[0]?.current_status || 'Unknown',
        delivered_date: trackingData?.shipment_track?.[0]?.delivered_date || null,
        origin: trackingData?.shipment_track?.[0]?.origin || '',
        destination: trackingData?.shipment_track?.[0]?.destination || '',
        courier_name: trackingData?.shipment_track?.[0]?.courier_name || order.courierName || '',
        edd: trackingData?.shipment_track?.[0]?.edd || null,
        awb: order.awbNumber,
        track_url: trackingData?.track_url || order.trackingUrl || '',
        activities: trackingData?.shipment_track_activities || [],
      },
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        estimatedDelivery: order.estimatedDelivery,
        trackingUrl: order.trackingUrl,
      },
    });
  } catch (error: any) {
    console.error('Order tracking error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking information',
    });
  }
};

// Notify customer + admin about a failed payment
export const notifyPaymentFailed = async (req: Request, res: Response) => {
  try {
    const { email, name, errorDescription, errorCode, razorpayOrderId } = req.body;
    const siteName = process.env.SITE_NAME || 'Tobo Digital';

    const promises: Promise<any>[] = [];

    // Customer email
    if (email) {
      promises.push(
        sendEmail({
          to: email,
          subject: `Payment Failed for your ${siteName} order`,
          text: [
            `Hi ${name || 'there'},`,
            '',
            'Unfortunately your payment could not be processed.',
            errorDescription ? `Reason: ${errorDescription}` : '',
            errorCode ? `Error code: ${errorCode}` : '',
            '',
            'Please try again or use a different payment method.',
            `Your cart has been saved — simply visit the site to retry.`,
            '',
            `— ${siteName} team`,
          ].filter(Boolean).join('\n'),
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#e53e3e;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:20px">${siteName}</h1>
  </div>
  <div style="padding:28px 32px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="margin-top:0;font-size:18px;color:#e53e3e">❌ Payment Failed</h2>
    <p>Hi <strong>${name || 'there'}</strong>,</p>
    <p>Unfortunately we were unable to process your payment.</p>
    ${errorDescription ? `<p style="background:#fff5f5;border-left:4px solid #e53e3e;padding:10px 14px;font-size:13px;color:#c53030">${errorDescription}</p>` : ''}
    <p>Your cart is still saved. Please <a href="${process.env.NEXT_PUBLIC_CLIENT_URL || '#'}/checkout" style="color:rgb(22,176,238)">try again</a> or use a different payment method.</p>
    <p style="font-size:13px;color:#888">If the issue persists, please contact our support team.</p>
  </div>
</div>`,
        })
      );
    }

    // Admin alert
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      promises.push(
        sendEmail({
          to: adminEmail,
          subject: `⚠️ Payment Failed — ${name || email || 'Unknown customer'}`,
          text: [
            `A payment failure occurred on ${siteName}.`,
            '',
            `Customer : ${name || 'N/A'} <${email || 'N/A'}>`,
            razorpayOrderId ? `Razorpay Order ID : ${razorpayOrderId}` : '',
            errorCode ? `Error Code        : ${errorCode}` : '',
            errorDescription ? `Description       : ${errorDescription}` : '',
          ].filter(Boolean).join('\n'),
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#1a1a2e;padding:20px 28px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:18px">⚠️ Payment Failure Alert — ${siteName}</h1>
  </div>
  <div style="padding:24px 28px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;font-size:14px">
      <tr><td style="color:#666;padding:4px 0;width:180px">Customer</td><td>${name || 'N/A'}${email ? ` &lt;${email}&gt;` : ''}</td></tr>
      ${razorpayOrderId ? `<tr><td style="color:#666;padding:4px 0">Razorpay Order ID</td><td>${razorpayOrderId}</td></tr>` : ''}
      ${errorCode ? `<tr><td style="color:#666;padding:4px 0">Error Code</td><td>${errorCode}</td></tr>` : ''}
      ${errorDescription ? `<tr><td style="color:#666;padding:4px 0">Description</td><td style="color:#c53030">${errorDescription}</td></tr>` : ''}
    </table>
  </div>
</div>`,
        })
      );
    }

    await Promise.allSettled(promises);
    res.json({ success: true });
  } catch (err: any) {
    console.error('notifyPaymentFailed error:', err?.message || err);
    res.status(500).json({ success: false });
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  createRazorpayOrder,
  verifyPayment,
  notifyPaymentFailed,
  getOrderTracking,
};



