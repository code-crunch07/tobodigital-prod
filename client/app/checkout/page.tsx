'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Lock, CreditCard, MapPin, User, Phone, Mail, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import LoginSignupDialog from '@/components/LoginSignupDialog';
import { getProductUrl } from '@/lib/product-url';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [continueAsGuest, setContinueAsGuest] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');

  // Indian States
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.yourPrice * item.quantity, 0);
  const shipping = 50; // Fixed shipping cost
  const tax = subtotal * 0.18; // 18% GST
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  const total = subtotal + shipping + tax - discount;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  // Detect already logged-in user and pre-fill from profile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.ok ? res.json() : null)
        .then((json) => {
          if (!json?.data) return;
          const u = json.data;
          const nameParts = (u.name || '').trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          setShippingAddress((prev) => ({
            ...prev,
            firstName: firstName || prev.firstName,
            lastName: lastName || prev.lastName,
            email: u.email || prev.email,
          }));
        })
        .catch(() => {});
    }
  }, []);

  const handleInputChange = (field: string, value: string, isBilling = false) => {
    if (isBilling) {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    } else {
      setShippingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingSameAsShipping = (checked: boolean) => {
    setBillingSameAsShipping(checked);
    if (checked) {
      setBillingAddress({
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Call backend API to validate coupon
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          amount: subtotal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedCoupon(data.data);
        setCouponError('');
      } else {
        const error = await response.json();
        setCouponError(error.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Unable to validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const validateForm = () => {
    if (!shippingAddress.firstName || !shippingAddress.lastName) {
      alert('Please enter your full name');
      return false;
    }
    if (!shippingAddress.email || !shippingAddress.email.includes('@')) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!shippingAddress.phone || shippingAddress.phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields');
      return false;
    }
    if (!billingSameAsShipping) {
      if (!billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zipCode) {
        alert('Please fill in all billing address fields');
        return false;
      }
    }
    return true;
  };

  const createRazorpayOrder = async () => {
    try {
      // Call your backend API to create Razorpay order
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/orders/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment gateway is loading. Please wait...');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder();

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        alert('Payment gateway not configured. Please contact support.');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'Tobo Digital',
        description: `Order for ${cartItems.length} item(s)`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // Payment successful
          try {
            // Verify payment on backend
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const verifyResponse = await fetch(`${API_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Create order in database
              await createOrder(response.razorpay_payment_id);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            alert(`Payment verification failed: ${error.message || 'Please contact support with payment ID: ' + response.razorpay_payment_id}`);
            setLoading(false);
          }
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
        },
        theme: {
          color: '#ED826F',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        onClose: function () {
          setLoading(false);
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || response.error.reason || 'Please try again'}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Failed to initiate payment: ${error.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  const createOrder = async (paymentId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const orderData = {
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.yourPrice,
        })),
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        billingAddress: billingSameAsShipping ? null : {
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.zipCode,
          country: billingAddress.country,
        },
        customer: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
        totalAmount: total,
        paymentMethod: 'razorpay',
        paymentId: paymentId,
        paymentStatus: 'paid',
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        clearCart();
        router.push(`/order-success?orderId=${result.data._id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Order creation failed. Please contact support with your payment ID.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div 
        className="relative h-[300px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, rgba(237, 130, 79, 0.95) 0%, rgba(22, 176, 238, 0.95) 100%), url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Checkout</h1>
          <nav className="flex items-center justify-center gap-2 text-white/90 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-white">Checkout</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sign In / Guest Section */}
            {!isLoggedIn && !continueAsGuest && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Sign In</h2>
                <p className="text-sm text-gray-600 mb-4">Sign in to save your shipping details for faster checkout, or continue as guest.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = ''}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowLoginDialog(true)}
                      className="px-6 py-2.5 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                      style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                    >
                      <LogIn className="h-4 w-4" />
                      Login / Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContinueAsGuest(true);
                        if (checkoutEmail.trim()) {
                          setShippingAddress((prev) => ({ ...prev, email: checkoutEmail.trim() }));
                        }
                      }}
                      className="px-6 py-2.5 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                    required
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                  <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => handleBillingSameAsShipping(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded"
                      style={{ accentColor: 'rgb(237, 130, 79)' }}
                    />
                  <span className="text-sm text-gray-700">Same as shipping address</span>
                </label>
              </div>
              {!billingSameAsShipping && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value, true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value, true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={billingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value, true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value, true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={billingAddress.country}
                      onChange={(e) => handleInputChange('country', e.target.value, true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      required
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer"
                  style={{ borderColor: 'rgb(237, 130, 79)' }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 border-gray-300"
                    style={{ accentColor: 'rgb(237, 130, 79)' }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Razorpay</div>
                    <div className="text-sm text-gray-600">Pay securely with Razorpay (Cards, UPI, Net Banking, Wallets)</div>
                  </div>
                  <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-8" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 items-start">
                    <Link
                      href={getProductUrl(item)}
                      className="flex-shrink-0 w-16 h-16 rounded overflow-hidden hover:opacity-90 transition-opacity block relative"
                    >
                      <img
                        src={item.mainImage || '/placeholder-product.jpg'}
                        alt={item.itemName}
                        className="w-full h-full object-cover object-center"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-gray-700 text-white text-xs font-semibold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={getProductUrl(item)}
                        className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#ff6b35] transition-colors block"
                      >
                        {item.itemName}
                      </Link>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatPrice(item.yourPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                      {formatPrice(item.yourPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Apply Coupon */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Apply Coupon</h3>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800 text-sm">Coupon Applied: {appliedCoupon.code}</p>
                        <p className="text-xs text-green-600 mt-1">
                          You save {appliedCoupon.discountPercentage}% ({formatPrice(discount)})
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = 'rgb(237, 130, 79)'}
                        onBlur={(e) => e.target.style.borderColor = ''}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 text-sm rounded-lg font-semibold text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                        onMouseEnter={(e) => {
                          if (!couponLoading) {
                            e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!couponLoading) {
                            e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
                          }
                        }}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-600">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({appliedCoupon.code})</span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold" style={{ color: 'rgb(237, 130, 79)' }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full text-white py-4 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                onMouseEnter={(e) => {
                  if (!loading && razorpayLoaded) {
                    e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && razorpayLoaded) {
                    e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your personal data will be used to process your order and support your experience throughout this website.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginSignupDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowLoginDialog(false);
        }}
        loginOnly={true}
      />
    </div>
  );
}

