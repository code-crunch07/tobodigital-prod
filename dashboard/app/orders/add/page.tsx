'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomers, getProducts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OrderForm from '@/components/OrderForm';

export default function AddOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        getCustomers(),
        getProducts({ limit: 1000 }),
      ]);
      setCustomers(customersRes.data?.customers || []);
      setProducts(productsRes.data?.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
          <p className="text-muted-foreground">Create a new order for a customer</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-6">
        <OrderForm
          customers={customers}
          products={products}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
