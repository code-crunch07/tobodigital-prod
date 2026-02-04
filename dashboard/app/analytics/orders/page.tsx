'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalyticsOrders } from '@/lib/api';

export default function OrderTrendsPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    orderData: { month: string; total: number; completed: number; pending: number; cancelled: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAnalyticsOrders();
        if (res?.data) setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load order analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Trends</h1>
            <p className="text-muted-foreground">Analyze order patterns and fulfillment</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Trends</h1>
            <p className="text-muted-foreground">Analyze order patterns and fulfillment</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const d = data!;
  const totalOrders = d.total;
  const completedOrders = d.completed;
  const pendingOrders = d.pending;
  const cancelledOrders = d.cancelled;
  const orderData = d.orderData?.length ? d.orderData : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Trends</h1>
          <p className="text-muted-foreground">Analyze order patterns and fulfillment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <ShoppingCart className="h-3 w-3 mr-1 text-blue-500" />
              Last 6 months
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-500">{completedOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}% success rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{pendingOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              In process
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-3xl text-red-500">{cancelledOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <XCircle className="h-3 w-3 mr-1 text-red-500" />
              {totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0}% cancellation rate
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Trends</CardTitle>
          <CardDescription>Monthly order volume and status breakdown (last 6 months)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#82ca9d" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#ffc658" name="Pending" />
              <Bar dataKey="cancelled" stackId="a" fill="#ff8042" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
