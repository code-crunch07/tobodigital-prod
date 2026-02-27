'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrderById, getCustomers, getProducts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OrderForm from '@/components/OrderForm';
import { downloadDocument } from '@/utils/documents';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadData();
    }
  }, [orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load order first so we can show a clearer error if it fails
      const orderRes = await getOrderById(orderId);
      setOrder(orderRes.data);

      // Best-effort loading of customers and products; don't block the page if they fail
      try {
        const customersRes = await getCustomers();
        setCustomers(customersRes.data?.customers || []);
      } catch (e) {
        console.error('Failed to load customers for order edit:', e);
      }

      try {
        const productsRes = await getProducts({ limit: 1000 });
        setProducts(productsRes.data?.products || []);
      } catch (e) {
        console.error('Failed to load products for order edit:', e);
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load order';
      alert(message);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/orders');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Order not found</p>
          <Button onClick={() => router.push('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
            <p className="text-muted-foreground">Update order information</p>
            <p className="text-sm text-muted-foreground mt-1">
              Order Number: {order.orderNumber}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button style={{ backgroundColor: 'rgb(237, 130, 79)', color: 'white' }}>
              <FileText className="mr-2 h-4 w-4" />
              Documents
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

      <div className="border rounded-lg bg-card p-6">
        <OrderForm
          order={order}
          customers={customers}
          products={products}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
