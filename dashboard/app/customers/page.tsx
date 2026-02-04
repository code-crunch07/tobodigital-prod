'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomers, deleteCustomer, createCustomer, updateCustomer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Users, Eye } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      setCustomers(response.data?.customers || response.data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleAddClick = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      password: '',
      role: customer.role || 'customer',
      isActive: customer.isActive !== undefined ? customer.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCustomer) {
        // Update existing customer
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateCustomer(editingCustomer._id, updateData);
      } else {
        // Create new customer
        if (!formData.password) {
          alert('Password is required for new customers');
          setSaving(false);
          return;
        }
        await createCustomer(formData);
      }
      setIsDialogOpen(false);
      loadCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert(error?.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.role?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts</p>
        </div>
        <Button onClick={handleAddClick} style={{ backgroundColor: 'rgb(237, 130, 79)', color: 'white' }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Customers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">
                      {searchTerm ? 'No customers found' : 'No customers found'}
                    </p>
                    <p className="text-sm">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'Click "Add Customer" to create your first customer'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <Badge>{customer.role || 'customer'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/customers/${customer._id}`)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" style={{ color: 'rgb(22, 176, 238)' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(customer)}
                        title="Edit Customer"
                      >
                        <Edit className="h-4 w-4" style={{ color: 'rgb(237, 130, 79)' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer._id)}
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update customer information below.'
                : 'Fill in the details to create a new customer account.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {!editingCustomer && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingCustomer ? 'Leave blank to keep current password' : 'Enter password'}
                  required={!editingCustomer}
                  style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                />
                {editingCustomer && (
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep current password
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger style={{
                    '--tw-ring-color': 'rgb(237, 130, 79)'
                  } as React.CSSProperties}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer font-medium">
                Active Account
              </Label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: saving ? 'rgb(200, 100, 50)' : 'rgb(237, 130, 79)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = 'rgb(220, 110, 60)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = 'rgb(237, 130, 79)';
                  }
                }}
              >
                {saving ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
