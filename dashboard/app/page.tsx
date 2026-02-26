'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/api';
import { IndianRupee, Package, ShoppingCart, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
  salesByMonth: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      processing: 'secondary',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats?.totalSales || 0),
      sub: 'All time revenue',
      Icon: IndianRupee,
      accent: 'border-l-primary bg-primary/5 dark:bg-primary/10',
      iconBg: 'bg-primary/15 dark:bg-primary/25 text-primary',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      sub: `${stats?.pendingOrders ?? 0} pending orders`,
      Icon: ShoppingCart,
      accent: 'border-l-[rgb(22,176,238)] bg-[rgb(22,176,238)]/5 dark:bg-[rgb(22,176,238)]/15',
      iconBg: 'bg-[rgb(22,176,238)]/15 dark:bg-[rgb(22,176,238)]/25 text-[rgb(22,176,238)]',
    },
    {
      title: 'Products',
      value: stats?.totalProducts ?? 0,
      sub: 'Active products',
      Icon: Package,
      accent: 'border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10',
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers ?? 0,
      sub: 'Total registered users',
      Icon: Users,
      accent: 'border-l-violet-500 bg-violet-500/5 dark:bg-violet-500/10',
      iconBg: 'bg-violet-500/15 dark:bg-violet-500/25 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 p-2 sm:p-0">
      {/* Modern header with glass effect */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-background to-[rgb(22,176,238)]/8 dark:from-primary/15 dark:to-[rgb(22,176,238)]/15 p-5 sm:p-6 shadow-sm backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your e-commerce platform</p>
      </div>

      {/* Stats Grid - modern cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ title, value, sub, Icon, accent, iconBg }) => (
          <Card key={title} className={`dashboard-card-interactive group border-l-4 rounded-2xl overflow-hidden ${accent} focus-within:ring-2 focus-within:ring-primary/20`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} transition-transform group-hover:scale-110`}>
                <Icon className="h-4 w-4 flex-shrink-0" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row - modern styling */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="dashboard-card-interactive min-w-0 overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Monthly sales overview</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.salesByMonth && stats.salesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.salesByMonth.map(item => ({
                  month: `${item._id.month}/${item._id.year}`,
                  sales: item.total,
                  orders: item.count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="rgb(237, 130, 79)" strokeWidth={2} name="Sales (₹)" dot={{ fill: 'rgb(237, 130, 79)' }} />
                  <Line type="monotone" dataKey="orders" stroke="rgb(22, 176, 238)" strokeWidth={2} name="Orders" dot={{ fill: 'rgb(22, 176, 238)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="dashboard-card-interactive min-w-0 overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.totalOrders > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: stats.completedOrders },
                      { name: 'Pending', value: stats.pendingOrders },
                      { name: 'Others', value: stats.totalOrders - stats.completedOrders - stats.pendingOrders }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Completed', value: stats.completedOrders },
                      { name: 'Pending', value: stats.pendingOrders },
                      { name: 'Others', value: stats.totalOrders - stats.completedOrders - stats.pendingOrders }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', 'rgb(237, 130, 79)', 'rgb(22, 176, 238)'][index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="dashboard-card-interactive min-w-0 overflow-hidden rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-1 overflow-x-auto">
              {stats.recentOrders.map((order: any) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4 last:border-0 hover:bg-muted/60 rounded-xl px-3 py-2 transition-all duration-200 cursor-default"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{order.orderNumber}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.customer?.name || 'Unknown Customer'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'Asia/Kolkata'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
