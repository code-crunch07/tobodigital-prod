import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

function parseDateRange(req: Request): { start: Date; end: Date } {
  const start = req.query.start ? new Date(req.query.start as string) : new Date(0);
  const end = req.query.end ? new Date(req.query.end as string) : new Date();
  if (isNaN(start.getTime())) start.setTime(0);
  if (isNaN(end.getTime())) end.setTime(Date.now());
  return { start, end };
}

// GET /api/reports/customers?start=&end=
export const getReportCustomers = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);
    const paidInRange = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          lastOrder: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$user.name', 'Unknown'] },
          email: { $ifNull: ['$user.email', ''] },
          orders: 1,
          totalSpent: 1,
          lastOrder: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);
    const totalRevenue = paidInRange.reduce((s: number, c: any) => s + (c.totalSpent || 0), 0);
    const totalOrdersInRange = paidInRange.reduce((s: number, c: any) => s + (c.orders || 0), 0);
    const totalCustomers = paidInRange.length;
    const activeCustomers = paidInRange.filter((c: any) => (c.orders || 0) > 0).length;
    const avgOrderValue = totalOrdersInRange > 0 ? totalRevenue / totalOrdersInRange : 0;
    const customerData = paidInRange.map((c: any) => ({
      id: c.id?.toString?.() || c._id?.toString?.(),
      name: c.name,
      email: c.email,
      orders: c.orders || 0,
      totalSpent: c.totalSpent || 0,
      lastOrder: c.lastOrder ? new Date(c.lastOrder).toISOString().split('T')[0] : '–',
      status: (c.orders || 0) >= 1 ? 'active' : 'inactive',
    }));

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        avgOrderValue,
        customerData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch customer report' });
  }
};

// GET /api/reports/orders?start=&end=
export const getReportOrders = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);
    const [statusCounts, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$status', value: { $sum: 1 } } },
      ]),
      Order.find({ createdAt: { $gte: start, $lte: end } })
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);
    const statusMap: Record<string, number> = {};
    const colors: Record<string, string> = {
      delivered: '#82ca9d',
      pending: '#ffc658',
      processing: '#8884d8',
      shipped: '#8884d8',
      cancelled: '#ff8042',
    };
    statusCounts.forEach((s: any) => { statusMap[s._id] = s.value; });
    const orderStatusData = [
      { name: 'Completed', value: statusMap['delivered'] || 0, color: '#82ca9d' },
      { name: 'Pending', value: statusMap['pending'] || 0, color: '#ffc658' },
      { name: 'Processing', value: (statusMap['processing'] || 0) + (statusMap['shipped'] || 0), color: '#8884d8' },
      { name: 'Cancelled', value: statusMap['cancelled'] || 0, color: '#ff8042' },
    ].filter((d) => d.value > 0);
    if (orderStatusData.length === 0) orderStatusData.push({ name: 'No orders', value: 1, color: '#ccc' });

    const totalOrders = statusCounts.reduce((s: number, x: any) => s + x.value, 0);
    const completedOrders = statusMap['delivered'] || 0;
    const totalRevenue = recentOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
    const orderData = recentOrders.map((o: any) => ({
      id: o.orderNumber || o._id?.toString?.(),
      customer: o.customer?.name || o.customer?.email || 'Guest',
      amount: o.totalAmount,
      status: o.status,
      date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '–',
      items: (o.items || []).length,
    }));

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        totalRevenue,
        avgOrderValue: orderData.length > 0 ? totalRevenue / orderData.length : 0,
        orderStatusData,
        orderData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch order report' });
  }
};

// GET /api/reports/sales?start=&end=
export const getReportSales = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(req);
    const daily = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const salesData = daily.map((d: any) => ({
      date: d._id,
      sales: Math.round(d.sales),
      orders: d.orders,
      revenue: Math.round(d.sales),
    }));
    const totalSales = daily.reduce((s: number, d: any) => s + (d.sales || 0), 0);
    const totalOrders = daily.reduce((s: number, d: any) => s + (d.orders || 0), 0);

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
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch sales report' });
  }
};

// GET /api/reports/stock
export const getReportStock = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .select('itemName productId stockQuantity yourPrice')
      .sort({ stockQuantity: 1 })
      .lean();
    const stockData = products.map((p: any) => {
      const current = p.stockQuantity ?? 0;
      const reserved = 0;
      const available = Math.max(0, current - reserved);
      let status = 'in_stock';
      if (current === 0) status = 'out_of_stock';
      else if (current <= 5) status = 'low_stock';
      return {
        id: p._id?.toString?.(),
        product: p.itemName,
        sku: p.productId || p._id?.toString?.(),
        current,
        reserved,
        available,
        status,
        unitValue: p.yourPrice ?? 0,
      };
    });
    const totalValue = stockData.reduce((s, i) => s + i.current * i.unitValue, 0);
    const lowStockItems = stockData.filter((i) => i.status === 'low_stock').length;
    const outOfStock = stockData.filter((i) => i.status === 'out_of_stock').length;

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalValue,
        lowStockItems,
        outOfStock,
        stockData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch stock report' });
  }
};
