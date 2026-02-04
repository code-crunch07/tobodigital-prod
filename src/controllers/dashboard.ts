import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total Sales
    const totalSales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Recent Orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'itemName mainImage')
      .sort({ createdAt: -1 })
      .limit(10);

    // Completed Orders
    const completedOrders = await Order.find({
      status: 'delivered',
    }).countDocuments();

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Pending Orders
    const pendingOrders = await Order.find({
      status: 'pending',
    }).countDocuments();

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Total Customers
    const totalCustomers = await User.find({
      role: 'customer',
    }).countDocuments();

    // Sales by Month (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalSales: totalSales[0]?.total || 0,
        recentOrders,
        completedOrders,
        totalOrders,
        pendingOrders,
        totalProducts,
        totalCustomers,
        salesByMonth,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Analytics: customers
const getAnalyticsCustomers = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await User.find({ role: 'customer' }).countDocuments();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const activeCustomerIds = await Order.distinct('customer', {
      paymentStatus: 'paid',
      createdAt: { $gte: ninetyDaysAgo },
    });
    const activeCustomers = activeCustomerIds.length;
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const orderCounts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          oneOrder: { $sum: { $cond: [{ $eq: ['$count', 1] }, 1, 0] } },
          multiOrder: { $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] } },
        },
      },
    ]);
    const oneOrder = orderCounts[0]?.oneOrder ?? 0;
    const multiOrder = orderCounts[0]?.multiOrder ?? 0;
    const newCustomers = oneOrder;
    const returningCustomers = multiOrder;
    const orderedCustomers = oneOrder + multiOrder;
    const retentionRate = orderedCustomers > 0 ? (multiOrder / orderedCustomers) * 100 : 0;
    const segments = [
      { name: 'New Customers', value: newCustomers, color: '#8884d8' },
      { name: 'Returning Customers', value: returningCustomers, color: '#82ca9d' },
      { name: 'Inactive (no order in 90d)', value: Math.max(0, totalCustomers - activeCustomers), color: '#ffc658' },
    ].filter((s) => s.value > 0);
    if (segments.length === 0) segments.push({ name: 'No data', value: 1, color: '#ccc' });

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        avgCustomerValue,
        retentionRate,
        segments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch customer analytics' });
  }
};

// Analytics: sales (reuse salesByMonth shape)
const getAnalyticsSales = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const [totalResult, byMonth] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);
    const totalSales = totalResult[0]?.total ?? 0;
    const totalOrders = totalResult[0]?.count ?? 0;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = byMonth.map((m: any) => ({
      month: monthNames[(m._id.month as number) - 1],
      sales: Math.round(m.sales),
      orders: m.orders,
    }));

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        salesData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch sales analytics' });
  }
};

// Analytics: orders (by month with status breakdown)
const getAnalyticsOrders = async (req: Request, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const byMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['pending', 'processing', 'shipped']] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const orderData = byMonth.map((m: any) => ({
      month: monthNames[(m._id.month as number) - 1],
      total: m.total,
      completed: m.completed,
      pending: m.pending,
      cancelled: m.cancelled,
    }));
    const totals = orderData.reduce(
      (acc: any, d: any) => ({
        total: acc.total + d.total,
        completed: acc.completed + d.completed,
        pending: acc.pending + d.pending,
        cancelled: acc.cancelled + d.cancelled,
      }),
      { total: 0, completed: 0, pending: 0, cancelled: 0 }
    );

    res.json({
      success: true,
      data: {
        ...totals,
        orderData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch order analytics' });
  }
};

// Analytics: products (counts + top by revenue)
const getAnalyticsProducts = async (req: Request, res: Response) => {
  try {
    const [totalProducts, activeProducts, lowStock, topProducts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stockQuantity: { $lte: 5, $gte: 0 } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orders: { $sum: 1 },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: '$_id',
            name: { $ifNull: ['$product.itemName', 'Unknown'] },
            sales: 1,
            orders: 1,
            views: { $literal: 0 },
          },
        },
      ]),
    ]);

    const topProductsList = topProducts.map((p: any) => ({
      id: p.id?.toString?.() || p._id?.toString?.(),
      name: p.name,
      sales: Math.round(p.sales),
      orders: p.orders,
      views: p.views ?? 0,
    }));

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        lowStockItems: lowStock,
        topProducts: topProductsList,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch product analytics' });
  }
};

export default {
  getDashboardStats,
  getAnalyticsCustomers,
  getAnalyticsSales,
  getAnalyticsOrders,
  getAnalyticsProducts,
};



