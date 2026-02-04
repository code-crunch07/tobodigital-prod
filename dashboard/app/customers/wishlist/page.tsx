'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Heart, Eye } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlists, setWishlists] = useState([
    {
      id: '1',
      customer: 'John Doe',
      email: 'john@example.com',
      items: 5,
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      items: 3,
      lastUpdated: '2024-01-14',
    },
    {
      id: '3',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      items: 8,
      lastUpdated: '2024-01-13',
    },
  ]);

  const totalItems = wishlists.reduce((sum, w) => sum + w.items, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist / Saved Items</h1>
          <p className="text-muted-foreground">View customer wishlists and saved items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Wishlists</CardDescription>
            <CardTitle className="text-3xl">{wishlists.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Saved Items</CardDescription>
            <CardTitle className="text-3xl">{totalItems}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Items/Wishlist</CardDescription>
            <CardTitle className="text-3xl">
              {(totalItems / wishlists.length || 0).toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Wishlists</CardTitle>
          <CardDescription>All customer wishlists and saved items</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Saved Items</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlists.map((wishlist) => (
                <TableRow key={wishlist.id}>
                  <TableCell className="font-medium">{wishlist.customer}</TableCell>
                  <TableCell>{wishlist.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      {wishlist.items}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wishlist.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
