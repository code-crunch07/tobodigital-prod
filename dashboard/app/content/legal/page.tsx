'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileCheck, Edit, Eye } from 'lucide-react';
import { getLegalPages } from '@/lib/api';

export default function LegalPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await getLegalPages();
      setPages(res.data || []);
    } catch (error) {
      console.error('Failed to load legal pages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

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

      <Card className="rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>Legal Pages</CardTitle>
          <CardDescription>Manage terms, privacy policy, and other legal pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Page Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Loading pages...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && pages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No legal pages yet. You can create them from the API or seed script.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  pages.map((page: any) => (
                    <TableRow key={page._id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        {page.lastUpdatedAt
                          ? new Date(page.lastUpdatedAt).toLocaleDateString()
                          : new Date(page.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/content/legal/${page._id}`)}
                          >
                            <Edit className="h-4 w-4" />
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
