import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import User from '../models/User';
import { createOrderNotification, createPaymentNotification } from './notifications';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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
    const { customer, items, shippingAddress, paymentMethod } = req.body;

    if (!customer || !items || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Customer, items, and shipping address are required',
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }

    const orderData = {
      orderNumber: generateOrderNumber(),
      customer,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    };

    const order = new Order(orderData);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product');

    // Create notification for new order
    await createOrderNotification(String(order._id));

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
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const verified = expected === razorpay_signature;
    res.json({
      success: verified,
      message: verified ? 'Payment verified' : 'Invalid signature',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Verification failed',
    });
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
};



