'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff006e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-semibold text-gray-900">{order.orderNumber || order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Total</p>
                  <p className="font-semibold text-[#ff006e]">{formatPrice(order.totalAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-semibold text-green-600 capitalize">{order.paymentStatus || 'Paid'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{order.status || 'Pending'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#ff006e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4005a] transition-colors"
            >
              <Home className="h-5 w-5" />
              Continue Shopping
            </Link>
            {orderId && (
              <Link
                href={`/my-account/orders/${orderId}`}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Package className="h-5 w-5" />
                View Order
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

