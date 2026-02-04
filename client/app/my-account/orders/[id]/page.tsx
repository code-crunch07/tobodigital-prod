'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  FileText,
  Printer,
} from 'lucide-react';
import { downloadInvoice, printInvoice } from '@/utils/invoice';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        router.push('/');
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const json = await response.json();
        const raw = json.data || json;
        const data = {
          ...raw,
          date: raw.createdAt || raw.date,
          total: raw.totalAmount ?? raw.total,
          subtotal: raw.totalAmount ?? raw.subtotal,
          shipping: raw.shipping ?? 0,
          tax: raw.tax ?? 0,
          discount: raw.discount ?? 0,
          shippingAddress: {
            ...(raw.shippingAddress || {}),
            firstName: raw.shippingAddress?.firstName ?? (raw.customer as any)?.firstName ?? '',
            lastName: raw.shippingAddress?.lastName ?? (raw.customer as any)?.lastName ?? '',
            phone: raw.shippingAddress?.phone ?? (raw.customer as any)?.phone ?? '',
            email: raw.shippingAddress?.email ?? (raw.customer as any)?.email ?? '',
          },
          items: (raw.items || []).map((item: any) => ({
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            yourPrice: item.price ?? item.yourPrice,
            itemName: item.product?.itemName ?? item.itemName,
            image: item.product?.mainImage ?? item.image,
            sku: item.sku ?? item.product?.sku,
          })),
        };
        setOrder(data);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      setOrder(null);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'shipped':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Truck };
      case 'processing':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Package };
    }
  };

  const handleReorder = () => {
    // TODO: Implement reorder functionality
    alert('Reorder functionality coming soon!');
  };

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      // TODO: Implement cancel order functionality
      alert('Cancel order functionality coming soon!');
    }
  };

  const handleDownloadInvoice = () => {
    if (order) {
      downloadInvoice(order);
    }
  };

  const handlePrintInvoice = () => {
    if (order) {
      printInvoice(order);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link
            href="/my-account"
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: 'rgb(237, 130, 79)' }}
          >
            Back to My Account
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusColor(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div
        className="relative h-[250px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, rgba(237, 130, 79, 0.95) 0%, rgba(22, 176, 238, 0.95) 100%)`,
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Order Details</h1>
          <p className="text-lg">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/my-account?tab=orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Orders
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${statusInfo.bg}`}>
                    <StatusIcon className={`h-6 w-6 ${statusInfo.text}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Order Status</h2>
                    <p className={`text-sm font-semibold ${statusInfo.text}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{formatDate(order.date)}</p>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold">{order.trackingNumber}</p>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold">{formatDate(order.estimatedDelivery)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/api/placeholder/150/150'}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/150/150';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.itemName}</h3>
                      {item.sku && (
                        <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{item.quantity}</span></p>
                          <p className="text-lg font-bold">{formatPrice(item.yourPrice * item.quantity)}</p>
                        </div>
                        <p className="text-sm text-gray-600">{formatPrice(item.yourPrice)} each</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5" style={{ color: 'rgb(22, 176, 238)' }} />
                <h2 className="text-xl font-bold">Shipping Address</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <div className="pt-2 space-y-1">
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {order.shippingAddress.phone}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    {order.shippingAddress.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            {order.billingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                  <h2 className="text-xl font-bold">Billing Address</h2>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  <p>{order.billingAddress.street}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{formatPrice(order.shipping)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coupon Applied</span>
                    <span className="font-semibold">{order.couponCode}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </button>
                <button
                  onClick={handleReorder}
                  className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(220, 110, 60)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(237, 130, 79)';
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reorder
                </button>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <Link
                href="/contact"
                className="text-sm font-semibold"
                style={{ color: 'rgb(22, 176, 238)' }}
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

