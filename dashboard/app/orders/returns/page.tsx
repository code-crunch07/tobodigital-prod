'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Plus } from 'lucide-react';

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState([
    {
      id: '1',
      orderNumber: 'ORD-001',
      product: 'Sample Product',
      reason: 'Defective',
      status: 'pending',
      requestedDate: '2024-01-15',
      amount: 99.99,
    },
  ]);
  const [showForm, setShowForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      refunded: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Returns / Refunds</h1>
            <p className="text-muted-foreground">Manage product returns and refunds</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Process Return
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Returns</CardDescription>
            <CardTitle className="text-3xl">
              {returns.filter((r) => r.status === 'pending').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {returns.filter((r) => r.status === 'approved').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Refunded</CardDescription>
            <CardTitle className="text-3xl text-blue-500">
              {returns.filter((r) => r.status === 'refunded').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Refunds</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                returns.filter((r) => r.status === 'refunded').reduce((sum, r) => sum + r.amount, 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Process New Return</CardTitle>
            <CardDescription>Initiate a return or refund request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order Number</Label>
                <Input placeholder="ORD-001" />
              </div>
              <div className="space-y-2">
                <Label>Return Reason</Label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Defective</option>
                  <option>Wrong Item</option>
                  <option>Not as Described</option>
                  <option>Changed Mind</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button>Process Return</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Returns & Refunds</CardTitle>
          <CardDescription>All return and refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No returns found
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((returnItem) => (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">{returnItem.orderNumber}</TableCell>
                    <TableCell>{returnItem.product}</TableCell>
                    <TableCell>{returnItem.reason}</TableCell>
                    <TableCell>{formatCurrency(returnItem.amount)}</TableCell>
                    <TableCell>{returnItem.requestedDate}</TableCell>
                    <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
