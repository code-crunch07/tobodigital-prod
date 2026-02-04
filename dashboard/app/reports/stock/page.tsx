'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Warehouse, Download, AlertTriangle } from 'lucide-react';
import { getReportStock } from '@/lib/api';

export default function StockReportPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStock: number;
    stockData: { id: string; product: string; sku: string; current: number; reserved: number; available: number; status: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getReportStock();
        if (res?.data) setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load stock report');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      in_stock: 'default',
      low_stock: 'secondary',
      out_of_stock: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  const handleExport = () => {
    alert('Export not implemented. Use browser print or add CSV export API.');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Report</h1>
            <p className="text-muted-foreground">Generate inventory stock reports</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stockData = data?.stockData ?? [];
  const totalValue = data?.totalValue ?? 0;
  const lowStockItems = data?.lowStockItems ?? 0;
  const outOfStock = data?.outOfStock ?? 0;
  const lowStockList = stockData.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Report</h1>
            <p className="text-muted-foreground">Generate inventory stock reports</p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Products</CardDescription>
                <CardTitle className="text-3xl">{data?.totalProducts ?? 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Stock Value</CardDescription>
                <CardTitle className="text-3xl">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Low Stock Items</CardDescription>
                <CardTitle className="text-3xl text-orange-500">{lowStockItems}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Out of Stock</CardDescription>
                <CardTitle className="text-3xl text-red-500">{outOfStock}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Report</CardTitle>
              <CardDescription>Current inventory levels and stock status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No products in catalog.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>{item.current}</TableCell>
                        <TableCell>{item.reserved}</TableCell>
                        <TableCell>{item.available}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {lowStockList.length > 0 && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Products requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{item.product}</span>
                      <Badge variant={item.status === 'out_of_stock' ? 'destructive' : 'secondary'}>
                        {item.current} units remaining
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
