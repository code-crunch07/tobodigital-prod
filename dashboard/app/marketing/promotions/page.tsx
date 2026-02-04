'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Gift, Plus, Edit, Trash2 } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';

type Coupon = {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
};

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountValue: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    startDate: '',
    endDate: '',
    usageLimit: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    isActive: true,
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();
      setPromotions(response?.data ?? []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (!coupon.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (end < now) return <Badge variant="secondary">Expired</Badge>;
    if (start > now) return <Badge variant="outline">Scheduled</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountValue: '',
      discountType: 'percentage',
      startDate: '',
      endDate: '',
      usageLimit: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (promo: Coupon) => {
    setEditingId(promo._id);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountValue: String(promo.discountValue),
      discountType: promo.discountType,
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
      usageLimit: promo.usageLimit != null ? String(promo.usageLimit) : '',
      minPurchaseAmount: promo.minPurchaseAmount != null ? String(promo.minPurchaseAmount) : '',
      maxDiscountAmount: promo.maxDiscountAmount != null ? String(promo.maxDiscountAmount) : '',
      isActive: promo.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!formData.code.trim()) {
      setSubmitError('Coupon code is required');
      return;
    }
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue < 0) {
      setSubmitError('Discount value must be a positive number');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setSubmitError('Start date and end date are required');
      return;
    }
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        discountType: formData.discountType,
        discountValue,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        isActive: formData.isActive,
      };
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      await loadPromotions();
      resetForm();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || error?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      await loadPromotions();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const activeCount = promotions.filter((p) => p.isActive && new Date(p.endDate) >= new Date()).length;
  const totalUses = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const avgDiscount =
    promotions.length > 0
      ? promotions.reduce((sum, p) => sum + p.discountValue, 0) / promotions.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promotions / Coupons</h1>
            <p className="text-muted-foreground">Manage discount codes and promotional offers</p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Coupons</CardDescription>
            <CardTitle className="text-3xl">{promotions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-500">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Uses</CardDescription>
            <CardTitle className="text-3xl">{totalUses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Discount</CardDescription>
            <CardTitle className="text-3xl">
              {promotions.length > 0 ? `${avgDiscount.toFixed(0)}%` : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</CardTitle>
            <CardDescription>Add or update a discount code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coupon Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    disabled={!!editingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% off on your order"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Active</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.isActive ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'yes' })}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Usage Limit (optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min. Purchase (₹, optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Discount (₹, optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  />
                </div>
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">{editingId ? 'Update' : 'Create'} Coupon</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Manage all discount codes and promotional offers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No coupons yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promo) => (
                    <TableRow key={promo._id}>
                      <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                      <TableCell>
                        {promo.discountType === 'percentage'
                          ? `${promo.discountValue}%`
                          : `₹${promo.discountValue}`}
                      </TableCell>
                      <TableCell className="capitalize">{promo.discountType}</TableCell>
                      <TableCell>{promo.usedCount ?? 0}</TableCell>
                      <TableCell>
                        {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '–'}
                      </TableCell>
                      <TableCell>
                        {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '–'}
                      </TableCell>
                      <TableCell>{getStatusBadge(promo)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(promo._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
