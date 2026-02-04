'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Truck, Package, Edit, FileText, Download } from 'lucide-react';
import { getOrders, updateOrder } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadDocument } from '@/utils/documents';

export default function ShippingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders({ limit: 1000 });
      const shippingOrders = (response.data?.orders || []).filter(
        (o: any) => o.status === 'processing' || o.status === 'shipped'
      );
      setOrders(shippingOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (orderId: string) => {
    try {
      await updateOrder(orderId, {
        trackingNumber,
        status: 'shipped',
      });
      setEditingId(null);
      setTrackingNumber('');
      loadOrders();
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Failed to update tracking number');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Delivery</h1>
          <p className="text-muted-foreground">Manage order shipments and tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready to Ship</CardDescription>
            <CardTitle className="text-3xl">
              {orders.filter((o) => o.status === 'processing').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Transit</CardDescription>
            <CardTitle className="text-3xl text-blue-500">
              {orders.filter((o) => o.status === 'shipped').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {orders.filter((o) => o.status === 'delivered').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Management</CardTitle>
          <CardDescription>Update tracking numbers and shipping status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">No orders to ship</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Shipping Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      {typeof order.customer === 'object' ? order.customer?.name : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.shippingAddress
                        ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    {editingId === order._id ? (
                      <>
                        <TableCell>
                          <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateTracking(order._id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setTrackingNumber('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-mono text-sm">
                          {order.trackingNumber || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingId(order._id);
                                setTrackingNumber(order.trackingNumber || '');
                              }}
                              title="Edit Tracking"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" title="Documents">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Download Documents</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => downloadDocument(order, 'invoice')}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadDocument(order, 'packing-slip')}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Packing Slip
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadDocument(order, 'delivery-note')}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Delivery Note
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => downloadDocument(order, 'shipping-label')}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Shipping Label
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadDocument(order, 'dispatch-label')}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Dispatch Label
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </>
                    )}
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
