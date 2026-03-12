import { Request, Response } from 'express';
import ReturnRequest from '../models/ReturnRequest';
import Order from '../models/Order';
import { sendEmail } from '../services/email';

const siteName = process.env.SITE_NAME || 'Tobo Digital';
const adminEmail = process.env.ADMIN_EMAIL;

// POST /api/returns — customer submits a return/replacement request
export const submitReturnRequest = async (req: Request, res: Response) => {
  try {
    const { orderId, type, reason, description, items } = req.body;
    const reqUser = (req as any).user;

    if (!orderId || !type || !reason || !items?.length) {
      return res.status(400).json({ success: false, message: 'orderId, type, reason and items are required.' });
    }

    const order = await Order.findById(orderId).populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Return/replacement can only be requested for delivered orders.' });
    }

    // Prevent duplicate pending requests for same order
    const existing = await ReturnRequest.findOne({ orderId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A return/replacement request is already pending for this order.' });
    }

    const customerDoc = order.customer as any;
    const customerName = reqUser?.name || customerDoc?.name || 'Customer';
    const customerEmail = reqUser?.email || customerDoc?.email || '';

    const returnReq = await ReturnRequest.create({
      orderId,
      orderNumber: order.orderNumber,
      customerId: reqUser?._id || order.customer,
      customerName,
      customerEmail,
      type,
      reason,
      description: description || '',
      items,
      status: 'pending',
    });

    // Email to customer
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `${type === 'return' ? 'Return' : 'Replacement'} Request Received — ${order.orderNumber} | ${siteName}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:rgb(22,176,238);padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:20px">${siteName}</h1>
  </div>
  <div style="padding:28px 32px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="margin-top:0;font-size:18px">${type === 'return' ? '↩️ Return' : '🔄 Replacement'} Request Received</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>We have received your ${type} request for order <strong>${order.orderNumber}</strong>.</p>
    <table style="width:100%;font-size:14px;margin:16px 0">
      <tr><td style="color:#666;padding:4px 0;width:140px">Request Type</td><td style="font-weight:600;text-transform:capitalize">${type}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Reason</td><td>${reason}</td></tr>
      ${description ? `<tr><td style="color:#666;padding:4px 0">Details</td><td>${description}</td></tr>` : ''}
    </table>
    <p style="background:#f0fbff;border-left:4px solid rgb(22,176,238);padding:10px 14px;font-size:13px;color:#0a6a8a;margin:16px 0">
      Our team will review your request within <strong>1–2 business days</strong> and contact you with next steps.
    </p>
    <p style="font-size:13px;color:#888">If you have questions, reply to this email.</p>
  </div>
</div>`,
        text: `Hi ${customerName},\n\nWe received your ${type} request for order ${order.orderNumber}.\nReason: ${reason}\n\nWe'll review it within 1-2 business days.\n\n— ${siteName}`,
      }).catch(() => {});
    }

    // Email to admin
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `⚠️ New ${type === 'return' ? 'Return' : 'Replacement'} Request — ${order.orderNumber}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#1a1a2e;padding:20px 28px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:18px">⚠️ New ${type === 'return' ? 'Return' : 'Replacement'} Request</h1>
  </div>
  <div style="padding:24px 28px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;font-size:14px">
      <tr><td style="color:#666;padding:4px 0;width:160px">Order</td><td style="font-weight:700">${order.orderNumber}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Customer</td><td>${customerName} &lt;${customerEmail}&gt;</td></tr>
      <tr><td style="color:#666;padding:4px 0">Type</td><td style="text-transform:capitalize;font-weight:600">${type}</td></tr>
      <tr><td style="color:#666;padding:4px 0">Reason</td><td>${reason}</td></tr>
      ${description ? `<tr><td style="color:#666;padding:4px 0">Details</td><td>${description}</td></tr>` : ''}
    </table>
    <p style="margin-top:16px;font-size:13px;color:#888">Login to the dashboard to review and take action.</p>
  </div>
</div>`,
        text: `New ${type} request for order ${order.orderNumber}.\nCustomer: ${customerName} <${customerEmail}>\nReason: ${reason}`,
      }).catch(() => {});
    }

    res.status(201).json({ success: true, message: 'Request submitted successfully.', data: returnReq });
  } catch (err: any) {
    console.error('submitReturnRequest error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit request.' });
  }
};

// GET /api/returns/my — customer's own requests
export const getMyReturnRequests = async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const requests = await ReturnRequest.find({ customerId: reqUser._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
};

// GET /api/returns/order/:orderId — get return request for a specific order
export const getReturnRequestByOrder = async (req: Request, res: Response) => {
  try {
    const request = await ReturnRequest.findOne({ orderId: req.params.orderId });
    res.json({ success: true, data: request || null });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch request.' });
  }
};

// GET /api/returns/admin/all — admin: all requests
export const getAllReturnRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const requests = await ReturnRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: requests, total: requests.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
};

// PATCH /api/returns/admin/:id — admin: update status + note
export const updateReturnRequest = async (req: Request, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    const request = await ReturnRequest.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminNote !== undefined && { adminNote }) },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    // Notify customer of status change
    if (status && request.customerEmail) {
      const statusLabel: Record<string, string> = {
        approved: '✅ Approved',
        rejected: '❌ Rejected',
        completed: '✔️ Completed',
      };
      const label = statusLabel[status];
      if (label) {
        await sendEmail({
          to: request.customerEmail,
          subject: `Your ${request.type} request has been ${status} — ${siteName}`,
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:rgb(22,176,238);padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:20px">${siteName}</h1>
  </div>
  <div style="padding:28px 32px;background:#fff;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="margin-top:0;font-size:18px">${label} — Your ${request.type} request</h2>
    <p>Hi <strong>${request.customerName}</strong>,</p>
    <p>Your ${request.type} request for order <strong>${request.orderNumber}</strong> has been <strong>${status}</strong>.</p>
    ${adminNote ? `<p style="background:#f9f9f9;border-left:4px solid #ccc;padding:10px 14px;font-size:13px">${adminNote}</p>` : ''}
    <p style="font-size:13px;color:#888">If you have questions, reply to this email.</p>
  </div>
</div>`,
          text: `Hi ${request.customerName},\n\nYour ${request.type} request for order ${request.orderNumber} has been ${status}.\n${adminNote ? `\nNote: ${adminNote}` : ''}\n\n— ${siteName}`,
        }).catch(() => {});
      }
    }

    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update request.' });
  }
};
