'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, getCategories, getSubCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productRes, categoriesRes, subCategoriesRes] = await Promise.all([
        getProductById(productId),
        getCategories(),
        getSubCategories(),
      ]);
      setProduct(productRes.data);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Product not found</p>
          <Button onClick={() => router.push('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/products')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-6">
        <ProductForm
          product={product}
          categories={categories}
          subCategories={subCategories}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

