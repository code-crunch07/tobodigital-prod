'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  Lock,
  Heart,
  LogOut,
  Edit,
  Plus,
  Eye,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

export default function MyAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'addresses' | 'profile' | 'password'>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressForm, setAddressForm] = useState({
    type: 'home',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    // Read tab from URL query params
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'addresses', 'profile', 'password'].includes(tab)) {
      setActiveTab(tab as 'dashboard' | 'addresses' | 'profile' | 'password');
    }
  }, []);

  const checkAuth = () => {
    // Check if user is logged in (this would come from your auth system)
    const token = localStorage.getItem('authToken');
    
    // For testing: Allow access without token (remove this in production)
    const allowTestAccess = true; // Set to false in production
    
    if (token || allowTestAccess) {
      setIsLoggedIn(true);
      loadUserData();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
      // Redirect to login if not authenticated
      // router.push('/login');
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        router.push('/');
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [userRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      let userEmail: string | null = null;
      if (userRes.ok) {
        const userJson = await userRes.json();
        const u = userJson.data || userJson;
        userEmail = u.email || null;
        setUserData({
          name: u.name || u.email || '',
          email: u.email || '',
          phone: u.phone || '',
          joinDate: u.createdAt || '',
        });
        setProfileForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
        });
      }
      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        const list = Array.isArray(ordersJson.data) ? ordersJson.data : ordersJson.data?.orders || [];
        setOrders(list.map((o: any) => ({
          id: o._id || o.id,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
          status: o.status || 'pending',
          total: o.totalAmount ?? o.total ?? 0,
          items: Array.isArray(o.items) ? o.items.length : 0,
        })));
      } else {
        setOrders([]);
      }

      // Load saved addresses from localStorage (keyed by user email)
      if (userEmail && typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(`user_addresses_${userEmail}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            const list = Array.isArray(parsed) ? parsed : [];
            setAddresses(list.map((a: any, i: number) => ({ ...a, id: a.id || `addr-${i}-${Date.now()}` })));
          } else {
            setAddresses([]);
          }
        } catch {
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API call to update profile
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        alert('Please sign in again');
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      alert('Failed to change password. Please try again.');
    }
  };

  const persistAddresses = (newAddresses: typeof addresses) => {
    if (typeof window === 'undefined' || !userData?.email) return;
    try {
      localStorage.setItem(`user_addresses_${userData.email}`, JSON.stringify(newAddresses));
    } catch {
      // ignore
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nextAddresses = editingAddress
        ? addresses.map(addr =>
            addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : addr
          )
        : [...addresses, { ...addressForm, id: Date.now().toString() }];
      setAddresses(nextAddresses);
      persistAddresses(nextAddresses);
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        type: 'home',
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false,
      });
    } catch (error) {
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const nextAddresses = addresses.filter(addr => addr.id !== id);
      setAddresses(nextAddresses);
      persistAddresses(nextAddresses);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      router.push('/');
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Note: Currently allows test access (allowTestAccess = true in checkAuth)
  // In production, remove the allowTestAccess check

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div
        className="relative h-[300px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, rgba(237, 130, 79, 0.95) 0%, rgba(22, 176, 238, 0.95) 100%)`,
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-lg">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-center">{userData?.name}</h3>
                <p className="text-sm text-gray-600 text-center">{userData?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'dashboard' ? { backgroundColor: 'rgb(237, 130, 79)' } : {}}
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </button>
                <Link
                  href="/my-account/orders"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Orders
                </Link>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'addresses'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'addresses' ? { backgroundColor: 'rgb(237, 130, 79)' } : {}}
                >
                  <MapPin className="h-5 w-5" />
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'profile' ? { backgroundColor: 'rgb(237, 130, 79)' } : {}}
                >
                  <Settings className="h-5 w-5" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'password'
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'password' ? { backgroundColor: 'rgb(237, 130, 79)' } : {}}
                >
                  <Lock className="h-5 w-5" />
                  Change Password
                </button>
                <Link
                  href="/my-account/wishlist"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-6">Account Overview</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="h-6 w-6" style={{ color: 'rgb(237, 130, 79)' }} />
                        <h3 className="font-semibold">Total Orders</h3>
                      </div>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-6 w-6" style={{ color: 'rgb(22, 176, 238)' }} />
                        <h3 className="font-semibold">Saved Addresses</h3>
                      </div>
                      <p className="text-2xl font-bold">{addresses.length}</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-6 w-6" style={{ color: 'rgb(237, 130, 79)' }} />
                        <h3 className="font-semibold">Member Since</h3>
                      </div>
                      <p className="text-lg font-semibold">{userData?.joinDate ? formatDate(userData.joinDate) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
                  {orders.length === 0 ? (
                    <p className="text-gray-600">No orders yet</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <Link
                          key={order.id}
                          href={`/my-account/orders/${order.id}`}
                          className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #{order.id}</h3>
                              <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-600">{order.items} item(s)</p>
                            <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddress(null);
                        setAddressForm({
                          type: 'home',
                          firstName: '',
                          lastName: '',
                          phone: '',
                          street: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: 'India',
                          isDefault: false,
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                    >
                      <Plus className="h-5 w-5" />
                      Add New Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-bold mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                            <select
                              value={addressForm.type}
                              onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.firstName}
                              onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.lastName}
                              onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                              type="tel"
                              required
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <select
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                            <input
                              type="text"
                              required
                              value={addressForm.zipCode}
                              onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                              type="text"
                              value={addressForm.country}
                              readOnly
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                className="h-4 w-4"
                              />
                              <span className="text-sm text-gray-700">Set as default address</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-lg font-semibold text-white"
                            style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                          >
                            {editingAddress ? 'Update Address' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                            }}
                            className="px-6 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold capitalize">{address.type}</h3>
                            {address.isDefault && (
                              <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressForm(address);
                                setShowAddressForm(true);
                              }}
                              className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: 'rgb(237, 130, 79)' }}
                  >
                    Change Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

