'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, Edit, Save, X } from 'lucide-react';
import { getProducts, updateProduct } from '@/lib/api';

export default function SEOManagerPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seoData, setSeoData] = useState({ title: '', description: '', keywords: '', slug: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 1000 });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setSeoData({
      title: product.seoTitle || product.itemName || '',
      description: product.seoDescription || product.productDescription?.substring(0, 160) || '',
      keywords: product.seoKeywords || product.genericKeyword?.join(', ') || '',
      slug: product.slug || product.itemName?.toLowerCase().replace(/\s+/g, '-') || '',
    });
  };

  const handleSave = async (productId: string) => {
    try {
      await updateProduct(productId, {
        seoTitle: seoData.title,
        seoDescription: seoData.description,
        seoKeywords: seoData.keywords,
        slug: seoData.slug,
      });
      setEditingId(null);
      loadProducts();
    } catch (error) {
      console.error('Error updating SEO:', error);
      alert('Failed to update SEO data');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setSeoData({ title: '', description: '', keywords: '', slug: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO / Meta Data Manager</h1>
          <p className="text-muted-foreground">Manage SEO settings for all products</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product SEO Settings</CardTitle>
          <CardDescription>Optimize product meta titles, descriptions, and keywords</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Meta Description</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">{product.itemName}</TableCell>
                      {editingId === product._id ? (
                        <>
                          <TableCell>
                            <Input
                              value={seoData.title}
                              onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                              placeholder="Meta Title (50-60 chars)"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={seoData.description}
                              onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                              placeholder="Meta Description (150-160 chars)"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={seoData.keywords}
                              onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                              placeholder="Keywords (comma-separated)"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={seoData.slug}
                              onChange={(e) => setSeoData({ ...seoData, slug: e.target.value })}
                              placeholder="URL Slug"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleSave(product._id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-sm text-muted-foreground">
                            {product.seoTitle || product.itemName || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {product.seoDescription || product.productDescription?.substring(0, 60) || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {product.seoKeywords || product.genericKeyword?.join(', ') || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {product.slug || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Meta Title:</strong> Keep between 50-60 characters for optimal display in search results</p>
          <p>• <strong>Meta Description:</strong> Aim for 150-160 characters to provide a compelling summary</p>
          <p>• <strong>Keywords:</strong> Use relevant, comma-separated keywords that describe your product</p>
          <p>• <strong>Slug:</strong> Use lowercase letters, numbers, and hyphens only. Keep it short and descriptive</p>
        </CardContent>
      </Card>
    </div>
  );
}
