'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Gift, Truck, Home } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { getProductUrl } from '@/lib/product-url';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.yourPrice * item.quantity, 0);
  const giftWrapPrice = giftWrap ? 2 : 0;
  const total = subtotal + giftWrapPrice;

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header with Background */}
      <div 
        className="relative h-[400px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, rgba(237, 130, 79, 0.95) 0%, rgba(22, 176, 238, 0.95) 100%), url("https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Your Cart</h1>
          <nav className="flex items-center justify-center gap-2 text-white/90">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Your Cart</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
              <Link
                href="/shop"
                className="inline-block text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">PRODUCT</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">QUANTITY</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">SUBTOTAL:</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-6">
                            <div className="flex gap-4">
                              <Link
                                href={getProductUrl(item)}
                                className="flex-shrink-0 w-24 h-24 rounded overflow-hidden hover:opacity-90 transition-opacity block"
                              >
                                <img
                                  src={item.mainImage || '/placeholder-product.jpg'}
                                  alt={item.itemName}
                                  className="w-full h-full object-cover object-center"
                                />
                              </Link>
                              <div className="flex flex-col justify-center min-w-0">
                                <Link
                                  href={getProductUrl(item)}
                                  className="font-medium text-gray-900 mb-1 hover:text-[#ff6b35] transition-colors line-clamp-2"
                                >
                                  {item.itemName}
                                </Link>
                                <p className="text-sm text-gray-600 mb-2">
                                  {formatPrice(item.yourPrice)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium w-16 text-center border-x border-gray-300">
                                  {String(item.quantity).padStart(2, '0')}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.yourPrice * item.quantity)}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link
                  href="/shop"
                  className="flex-1 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
                  style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                >
                  CONTINUE SHOPPING
                </Link>
                <button
                  onClick={handleDeleteAll}
                  className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(220, 110, 60)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(237, 130, 79)'}
                >
                  DELETE ALL
                </button>
              </div>

              {/* Gift Wrap Option */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                  <h3 className="font-semibold text-gray-900">Do you want a gift wrap? Only ₹2.00</h3>
                </div>
                <button
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    giftWrap
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'text-white'
                  }`}
                  style={giftWrap ? {} : { backgroundColor: 'rgb(22, 176, 238)' }}
                  onMouseEnter={(e) => {
                    if (giftWrap) return;
                    e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
                  }}
                  onMouseLeave={(e) => {
                    if (giftWrap) return;
                    e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
                  }}
                >
                  {giftWrap ? 'REMOVE GIFT WRAP' : 'ADD A GIFT WRAP'}
                </button>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add Order Note</h3>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  rows={4}
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">CART TOTALS</h2>

                {/* Subtotal */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                {/* Estimate Shipping */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">ESTIMATE SHIPPING RATES</h3>
                  <div className="space-y-3">
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                    <select
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Gujarat">Gujarat</option>
                    </select>
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="Zip/Postal Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                    <button 
                      className="w-full text-white py-2 rounded-lg font-semibold transition-colors"
                      style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                    >
                      CALCULATE SHIPPING RATES
                    </button>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">COUPON</h3>
                  <p className="text-sm text-gray-600 mb-3">Coupon code will work on checkout page.</p>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>

                {/* Order Totals */}
                <div className="mb-6">
                  {giftWrap && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-600">Gift Wrap</span>
                      <span className="text-gray-900">{formatPrice(giftWrapPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold" style={{ color: 'rgb(237, 130, 79)' }}>Order Totals</span>
                    <span className="text-xl font-bold" style={{ color: 'rgb(237, 130, 79)' }}>{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Taxes and shipping calculated at checkout</p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full text-white py-4 rounded-lg font-bold text-lg transition-colors"
                  style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                >
                  CHECK OUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

