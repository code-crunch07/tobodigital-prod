'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileCheck, Edit, Eye } from 'lucide-react';

export default function LegalPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState([
    { id: '1', title: 'Terms of Service', slug: 'terms-of-service', lastUpdated: '2024-01-15' },
    { id: '2', title: 'Privacy Policy', slug: 'privacy-policy', lastUpdated: '2024-01-10' },
    { id: '3', title: 'Refund Policy', slug: 'refund-policy', lastUpdated: '2024-01-05' },
    { id: '4', title: 'Shipping Policy', slug: 'shipping-policy', lastUpdated: '2023-12-20' },
    { id: '5', title: 'Cookie Policy', slug: 'cookie-policy', lastUpdated: '2023-12-15' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Pages</h1>
          <p className="text-muted-foreground">Manage legal and policy pages</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Pages</CardTitle>
          <CardDescription>Manage terms, privacy policy, and other legal pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>{page.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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
