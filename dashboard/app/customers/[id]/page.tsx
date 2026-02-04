'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCustomerById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, User, Calendar, Shield } from 'lucide-react';

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await getCustomerById(customerId);
      setCustomer(response.data || response);
    } catch (error) {
      console.error('Error loading customer:', error);
      alert('Failed to load customer details');
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
            <p className="text-muted-foreground">View customer information</p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/customers')}
          style={{ backgroundColor: 'rgb(237, 130, 79)', color: 'white' }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Full Name</Label>
              <p className="text-sm font-medium mt-1">{customer.name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <p className="text-sm font-medium mt-1">{customer.email}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <div className="mt-1">
                <Badge>{customer.role || 'customer'}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Account Status</Label>
              <div className="mt-1">
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: 'rgb(22, 176, 238)' }} />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Account Created</Label>
              <p className="text-sm font-medium mt-1">
                {customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Last Updated</Label>
              <p className="text-sm font-medium mt-1">
                {customer.updatedAt ? formatDate(customer.updatedAt) : 'N/A'}
              </p>
            </div>
            {customer.lastLogin && (
              <div>
                <Label className="text-sm text-gray-500">Last Login</Label>
                <p className="text-sm font-medium mt-1">
                  {formatDate(customer.lastLogin)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

