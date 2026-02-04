'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Package, Edit } from 'lucide-react';
import { getProducts } from '@/lib/api';

export default function LowStockAlertsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    loadProducts();
  }, [threshold]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 1000 });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < threshold);
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0);

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    return <Badge variant="secondary">Low Stock ({stock} remaining)</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground">Monitor products with low inventory levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alert Threshold</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">units</span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low Stock Items</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{lowStockProducts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Out of Stock</CardDescription>
            <CardTitle className="text-3xl text-red-500">{outOfStockProducts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">All products are well stocked!</p>
              <p className="text-sm">No low stock alerts at this time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.itemName}</TableCell>
                    <TableCell className="font-mono text-sm">{product.productId || '-'}</TableCell>
                    <TableCell className="font-medium text-red-500">
                      {product.stockQuantity || 0}
                    </TableCell>
                    <TableCell>{threshold}</TableCell>
                    <TableCell>{getStockBadge(product.stockQuantity || 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
