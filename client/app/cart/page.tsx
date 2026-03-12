'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Gift, Truck, Home, Loader2, ChevronLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { getProductUrl } from '@/lib/product-url';
import { calculateShippingRate } from '@/lib/api';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingResult, setShippingResult] = useState<{ rate: number; etd: string } | null>(null);
  const [shippingError, setShippingError] = useState('');

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

  const handleCalculateShipping = async () => {
    if (!shippingZip || shippingZip.length < 5) {
      setShippingError('Please enter a valid pincode');
      return;
    }
    setShippingLoading(true);
    setShippingError('');
    setShippingResult(null);
    try {
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0);
      const response = await calculateShippingRate({
        pickup_pincode: '400001',
        delivery_pincode: shippingZip,
        weight: Math.max(totalWeight, 0.5),
      });

      // Backend returns: { success, available, rates: [...courier companies] }
      const couriers: any[] =
        response?.rates ||                                    // our backend shape
        response?.data?.available_courier_companies ||        // raw Shiprocket shape
        response?.available_courier_companies ||              // alternative
        [];

      if (couriers.length > 0) {
        const cheapest = couriers.reduce(
          (min: any, c: any) => (parseFloat(c.rate) < parseFloat(min.rate) ? c : min),
          couriers[0]
        );
        setShippingResult({
          rate: parseFloat(cheapest.rate) || 0,
          etd: cheapest.etd || cheapest.estimated_delivery_days || '3–5 business days',
        });
      } else if (response?.success === false) {
        setShippingError(response?.message || 'Shipping unavailable to this pincode.');
      } else {
        setShippingError('No shipping options available for this pincode.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to calculate shipping. Please try again.';
      setShippingError(msg);
    } finally {
      setShippingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 flex items-center justify-between gap-6 w-full min-w-0">
          {/* Left: Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              <span className="text-[#f97316] text-xs">⚡</span>
              <span>Review your selection</span>
            </div>
            <div className="leading-none">
              <div className="font-[var(--heading-font-family)] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900">
                YOUR
              </div>
              <div className="font-[var(--heading-font-family)] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-300">
                CART<span className="text-gray-300">.</span>
              </div>
            </div>
          </div>

          {/* Right: Continue shopping */}
          <div className="hidden sm:flex items-center">
            <Link
              href="/shop"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-[0.25em]"
            >
              <span className="text-base">←</span>
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 w-full min-w-0">
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
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 min-w-0">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Mobile: card per item */}
              <div className="lg:hidden space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.lineId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex gap-3">
                      <Link
                        href={getProductUrl(item)}
                        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden hover:opacity-90 transition-opacity block"
                      >
                        <img
                          src={item.mainImage || '/placeholder-product.jpg'}
                          alt={item.itemName}
                          className="w-full h-full object-cover object-center"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={getProductUrl(item)}
                          className="font-medium text-sm text-gray-900 hover:text-[#ff6b35] transition-colors line-clamp-2 block"
                        >
                          {item.itemName}
                        </Link>
                        {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {Object.entries(item.variantAttributes)
                              .map(([name, value]) => `${name}: ${value}`)
                              .join(' · ')}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatPrice(item.yourPrice)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium w-10 text-center border-x border-gray-300">
                              {String(item.quantity).padStart(2, '0')}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {formatPrice(item.yourPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.lineId)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Cart Table */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">PRODUCT</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">QUANTITY</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">SUBTOTAL</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <tr key={item.lineId} className="hover:bg-gray-50">
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
                                {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    {Object.entries(item.variantAttributes)
                                      .map(([name, value]) => `${name}: ${value}`)
                                      .join(' · ')}
                                  </p>
                                )}
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
                                  onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium w-16 text-center border-x border-gray-300">
                                  {String(item.quantity).padStart(2, '0')}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
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
                              onClick={() => removeFromCart(item.lineId)}
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
              <div className="flex items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
                <button
                  onClick={handleDeleteAll}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-3 py-2"
                >
                  Clear Cart
                </button>
              </div>

              {/* Gift Wrap Option */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 sm:px-5 sm:py-3.5 min-w-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Gift className="h-4 w-4 flex-shrink-0" style={{ color: 'rgb(22, 176, 238)' }} />
                  <span className="text-sm text-gray-700">Add gift wrap for <strong className="text-gray-900">₹2</strong></span>
                </div>
                <button
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${giftWrap ? 'bg-[rgb(22,176,238)]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${giftWrap ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
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
            <div className="lg:col-span-1 min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-4 w-full max-w-full box-border">
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
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Estimate Shipping</h3>
                  <div className="space-y-2.5">
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[rgb(22,176,238)] focus:border-[rgb(22,176,238)] outline-none"
                    >
                      <option value="India">India</option>
                    </select>
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => { setShippingZip(e.target.value); setShippingError(''); setShippingResult(null); }}
                      placeholder="Enter delivery pincode"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[rgb(22,176,238)] focus:border-[rgb(22,176,238)] outline-none"
                    />
                    <button
                      onClick={handleCalculateShipping}
                      disabled={shippingLoading}
                      className="w-full text-white py-2 rounded text-sm font-semibold transition-colors disabled:opacity-60 bg-[rgb(22,176,238)] hover:bg-[rgb(18,150,200)]"
                    >
                      {shippingLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Calculate Shipping'}
                    </button>
                    {shippingResult && (
                      <div className="bg-green-50 border border-green-200 rounded p-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Shipping</span>
                          <span className="font-semibold text-green-800">{formatPrice(shippingResult.rate)}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Est. delivery: {shippingResult.etd}</p>
                      </div>
                    )}
                    {shippingError && (
                      <p className="text-xs text-red-500">{shippingError}</p>
                    )}
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Coupon</h3>
                  <p className="text-xs text-gray-500 mb-2.5">Coupon code will work on checkout page.</p>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[rgb(22,176,238)] focus:border-[rgb(22,176,238)] outline-none"
                  />
                </div>

                {/* Order Totals */}
                <div className="mb-5">
                  {giftWrap && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Gift Wrap</span>
                      <span className="text-gray-900">{formatPrice(giftWrapPrice)}</span>
                    </div>
                  )}
                  {shippingResult && (
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-900">{formatPrice(shippingResult.rate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">Order Total</span>
                    <span className="text-lg font-bold text-[rgb(22,176,238)]">{formatPrice(total + (shippingResult?.rate || 0))}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Taxes and shipping calculated at checkout</p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full text-white py-3 rounded font-semibold text-sm transition-colors bg-[rgb(22,176,238)] hover:bg-[rgb(18,150,200)]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

