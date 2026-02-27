'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Plus, Edit, Trash2, Star, Check, X } from 'lucide-react';

export default function TestimonialsPage() {
  const router = useRouter();
  // Start with no demo data; real testimonials should come from the API later.
  const [testimonials, setTestimonials] = useState<
    { id: string; name: string; rating: number; comment: string; status: string; date: string }[]
  >([]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const handleApprove = (id: string) => {
    setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const handleReject = (id: string) => {
    setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
            <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Testimonials</CardDescription>
            <CardTitle className="text-3xl">{testimonials.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {testimonials.filter((t) => t.status === 'approved').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-orange-500">
              {testimonials.filter((t) => t.status === 'pending').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>Customer Testimonials</CardTitle>
          <CardDescription>Review and manage customer testimonials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">{renderStars(testimonial.rating)}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{testimonial.comment}</TableCell>
                    <TableCell>{testimonial.date}</TableCell>
                    <TableCell>{getStatusBadge(testimonial.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {testimonial.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(testimonial.id)}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReject(testimonial.id)}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
