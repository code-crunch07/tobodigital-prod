'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  Search,
  X,
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      router.push('/');
      return;
    }
    
    setIsLoggedIn(true);
    loadOrders();
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle API response structure: { success: true, data: { orders: [...], ... } }
        const ordersArray = Array.isArray(data.data) 
          ? data.data 
          : (data.data?.orders || []);
        setAllOrders(ordersArray);
        setOrders(ordersArray);
      } else {
        setAllOrders([]);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Ensure orders is always an array
      setAllOrders([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setOrders(allOrders);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allOrders.filter((order) => {
      // Search by order number
      const orderNumber = (order.orderNumber || order._id || '').toLowerCase();
      if (orderNumber.includes(query)) return true;

      // Search by status
      const status = (order.status || '').toLowerCase();
      if (status.includes(query)) return true;

      // Search by item names
      const items = order.items || [];
      const hasMatchingItem = items.some((item: any) => {
        const itemName = (item.itemName || '').toLowerCase();
        return itemName.includes(query);
      });
      if (hasMatchingItem) return true;

      return false;
    });

    setOrders(filtered);
  }, [searchQuery, allOrders]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">
                View and track all your orders
              </p>
            </div>
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Found {orders.length} {orders.length === 1 ? 'order' : 'orders'} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link
              href="/shop"
              className="inline-block bg-[#ff006e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4005a] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id || order.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber || order._id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Placed on {formatDate(order.createdAt || order.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#ff006e]">
                        {formatPrice(order.totalAmount || order.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(order.items || []).length} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3">
                    {(order.items || []).map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPrice(item.price || item.yourPrice)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatPrice((item.price || item.yourPrice) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/my-account/orders/${order._id || order.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

