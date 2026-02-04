'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReportSales } from '@/lib/api';

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function SalesReportPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [data, setData] = useState<{
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    salesData: { date: string; sales: number; orders: number; revenue: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportSales({ start: dateRange.start, end: dateRange.end });
      if (res?.data) setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    alert('Export not implemented. Use browser print or add CSV/PDF export API.');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
            <p className="text-muted-foreground">Generate comprehensive sales reports</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const d = data!;
  const salesData = d?.salesData ?? [];
  const totalSales = d?.totalSales ?? 0;
  const totalOrders = d?.totalOrders ?? 0;
  const avgOrderValue = d?.avgOrderValue ?? (totalOrders ? totalSales / totalOrders : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
            <p className="text-muted-foreground">Generate comprehensive sales reports (paid orders only)</p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Select date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={load} disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-3xl">₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{totalOrders}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Order Value</CardDescription>
                <CardTitle className="text-3xl">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Growth Rate</CardDescription>
                <CardTitle className="text-3xl text-green-500">–</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Add comparison period for %</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Daily sales (paid orders)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Breakdown</CardTitle>
              <CardDescription>Detailed daily sales data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No sales in this date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>₹{item.sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell>₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
