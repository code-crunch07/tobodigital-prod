'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Download, Filter } from 'lucide-react';
import { getReportCustomers } from '@/lib/api';

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function CustomerReportPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [data, setData] = useState<{
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: number;
    avgOrderValue: number;
    customerData: { id: string; name: string; email: string; orders: number; totalSpent: number; lastOrder: string; status: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportCustomers({ start: dateRange.start, end: dateRange.end });
      if (res?.data) setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load customer report');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    alert('Export not implemented. Use browser print or add a CSV/PDF export API.');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Report</h1>
            <p className="text-muted-foreground">Generate comprehensive customer reports</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const d = data!;
  const customerData = d?.customerData ?? [];
  const totalCustomers = d?.totalCustomers ?? 0;
  const activeCustomers = d?.activeCustomers ?? 0;
  const totalRevenue = d?.totalRevenue ?? 0;
  const totalOrderCount = customerData.reduce((s, c) => s + c.orders, 0);
  const avgOrderValue = totalOrderCount > 0 ? (d?.avgOrderValue ?? totalRevenue / totalOrderCount) : (d?.avgOrderValue ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Report</h1>
            <p className="text-muted-foreground">Generate comprehensive customer reports</p>
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
          <CardDescription>Select date range (orders paid in this period)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
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
                <CardDescription>Total Customers</CardDescription>
                <CardTitle className="text-3xl">{totalCustomers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Customers</CardDescription>
                <CardTitle className="text-3xl text-green-500">{activeCustomers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-3xl">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Order Value</CardDescription>
                <CardTitle className="text-3xl">₹{avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Report</CardTitle>
              <CardDescription>Customers with paid orders in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No customer data for this date range.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>₹{customer.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{customer.lastOrder}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {customer.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest spending customers in period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.slice(0, 3).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data.</p>
                ) : (
                  customerData
                    .slice(0, 3)
                    .map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{customer.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
