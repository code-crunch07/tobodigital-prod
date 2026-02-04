'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrder, updateOrder } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface OrderFormProps {
  order?: any;
  customers: any[];
  products: any[];
  onSuccess: () => void;
}

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export default function OrderForm({ order, customers, products, onSuccess }: OrderFormProps) {
  const [formData, setFormData] = useState({
    customer: '',
    items: [] as OrderItem[],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    paymentMethod: '',
    status: 'pending' as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'failed' | 'refunded',
  });

  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (order) {
      const items = order.items?.map((item: any) => ({
        product: typeof item.product === 'object' ? item.product._id : item.product,
        quantity: item.quantity,
        price: item.price,
      })) || [];

      setFormData({
        customer: typeof order.customer === 'object' ? order.customer._id : order.customer,
        items,
        shippingAddress: order.shippingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        paymentMethod: order.paymentMethod || '',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
      });

      setTotalAmount(order.totalAmount || 0);
    }
  }, [order]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [formData.items]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product: '',
          quantity: 1,
          price: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-update price when product is selected
    if (field === 'product' && value) {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        newItems[index].price = selectedProduct.yourPrice || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (formData.items.some((item) => !item.product)) {
      alert('Please select a product for all items');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customer: formData.customer,
        items: formData.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
      };

      if (order) {
        await updateOrder(order._id, orderData);
      } else {
        await createOrder(orderData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving order:', error);
      alert(error.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Customer *</Label>
            <Select
              value={formData.customer}
              onValueChange={(value) => setFormData({ ...formData, customer: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Order Items */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Items</h2>
          <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="space-y-4">
          {formData.items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No items added. Click "Add Item" to add products.
            </p>
          ) : (
            formData.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Item {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative z-[100]">
                    <Label>Product *</Label>
                    <Select
                      value={item.product}
                      onValueChange={(value) => handleItemChange(index, 'product', value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] max-h-[300px] w-[var(--radix-select-trigger-width)]">
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id} className="truncate pr-8">
                            <span className="truncate block max-w-full" title={`${product.itemName} - ₹${product.yourPrice}`}>
                              {product.itemName} - ₹{product.yourPrice}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, 'price', parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">
                  Subtotal: ₹{(item.quantity * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Shipping Address */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <div>
            <Label>Street *</Label>
            <Input
              value={formData.shippingAddress.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, street: e.target.value },
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <Input
                value={formData.shippingAddress.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, city: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input
                value={formData.shippingAddress.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, state: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Zip Code *</Label>
              <Input
                value={formData.shippingAddress.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, zipCode: e.target.value },
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Country *</Label>
              <Input
                value={formData.shippingAddress.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, country: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Payment & Status */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Payment & Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Payment Method</Label>
            <Input
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="e.g., Credit Card, PayPal, Cash"
            />
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select
              value={formData.paymentStatus}
              onValueChange={(value: any) =>
                setFormData({ ...formData, paymentStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Order Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}
