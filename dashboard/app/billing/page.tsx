'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Building2, MapPin, Phone, Mail, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
}

export default function BillingPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true,
    },
  ]);
  const [billingAddress, setBillingAddress] = useState({
    company: 'Tobo Digital',
    address: '123 Business Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India',
    phone: '+91 1234567890',
    email: 'billing@tobo.com',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cardNumber = newCard.cardNumber.replace(/\s/g, '');
      const newPaymentMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        expiry: newCard.expiry,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setNewCard({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
      setShowAddCard(false);
      setSuccess('Payment method added successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  const handleBillingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Billing information updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update billing information');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your payment methods and billing information
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your payment methods for subscriptions and invoices
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddCard(!showAddCard)}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddCard && (
            <form onSubmit={handleAddCard} className="mb-6 p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold">Add New Card</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: formatCardNumber(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={newCard.cardName}
                    onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                    placeholder="John Doe"
                    required
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={newCard.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setNewCard({ ...newCard, expiry: value });
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    required
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: 'rgb(237, 130, 79)',
                    color: 'white'
                  }}
                >
                  {loading ? 'Adding...' : 'Add Card'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddCard(false);
                    setNewCard({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No payment methods added yet
              </p>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(237, 130, 79, 0.1)' }}>
                      <CreditCard className="h-6 w-6" style={{ color: 'rgb(237, 130, 79)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(237, 130, 79, 0.1)', color: 'rgb(237, 130, 79)' }}>
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCard(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{ color: 'rgb(22, 176, 238)' }} />
            Billing Address
          </CardTitle>
          <CardDescription>
            Update your billing address for invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBillingUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={billingAddress.company}
                  onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })}
                  placeholder="Company Name"
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div>
                <Label htmlFor="email">Billing Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={billingAddress.email}
                    onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                    placeholder="billing@example.com"
                    className="pl-10"
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={billingAddress.address}
                  onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                  placeholder="123 Main Street"
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  placeholder="City"
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                  placeholder="State"
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input
                  id="zip"
                  value={billingAddress.zip}
                  onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                  placeholder="12345"
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={billingAddress.country}
                  onValueChange={(value) => setBillingAddress({ ...billingAddress, country: value })}
                >
                  <SelectTrigger style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={billingAddress.phone}
                    onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="pl-10"
                    style={{
                      '--tw-ring-color': 'rgb(237, 130, 79)'
                    } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
              style={{
                backgroundColor: loading ? 'rgb(150, 180, 200)' : 'rgb(22, 176, 238)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
                }
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Billing Address'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No billing history available</p>
            <p className="text-sm mt-2">Your invoices will appear here once you start using paid features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

