import { Request, Response } from 'express';
import Notification from '../models/Notification';
import Order from '../models/Order';
import Product from '../models/Product';

// Get all notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { limit = '20', unreadOnly } = req.query;
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const query: Record<string, unknown> = {};
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[getNotifications]', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch notifications',
      data: [],
      unreadCount: 0,
    });
  }
};

// Get notification by ID
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { read: false },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create notification (internal use, can also be called via API)
export const createNotification = async (
  title: string,
  message: string,
  type: 'order' | 'stock' | 'payment' | 'system' | 'other' = 'other',
  relatedId?: string,
  relatedModel?: 'Order' | 'Product'
) => {
  try {
    const notification = new Notification({
      title,
      message,
      type,
      relatedId: relatedId ? relatedId : undefined,
      relatedModel,
      read: false,
    });

    await notification.save();
    return notification;
  } catch (error: any) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification for new order
export const createOrderNotification = async (orderId: string) => {
  try {
    const order = await Order.findById(orderId).populate('customer', 'name');
    if (!order) return;

    const customerName = (order.customer as any)?.name || 'Customer';
    const title = 'New Order Received';
    const message = `Order #${order.orderNumber} has been placed by ${customerName}`;

    return await createNotification(title, message, 'order', orderId, 'Order');
  } catch (error: any) {
    console.error('Error creating order notification:', error);
  }
};

// Create notification for low stock
export const createLowStockNotification = async (productId: string) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const title = 'Low Stock Alert';
    const message = `Product "${product.itemName}" is running low (${product.stockQuantity} remaining)`;

    return await createNotification(title, message, 'stock', productId, 'Product');
  } catch (error: any) {
    console.error('Error creating low stock notification:', error);
  }
};

// Create notification for payment received
export const createPaymentNotification = async (orderId: string) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    const title = 'Payment Received';
    const message = `Payment for Order #${order.orderNumber} has been confirmed`;

    return await createNotification(title, message, 'payment', orderId, 'Order');
  } catch (error: any) {
    console.error('Error creating payment notification:', error);
  }
};

// API endpoint to create notification
export const createNotificationAPI = async (req: Request, res: Response) => {
  try {
    const { title, message, type, relatedId, relatedModel } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    const notification = await createNotification(
      title,
      message,
      type || 'other',
      relatedId,
      relatedModel
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

