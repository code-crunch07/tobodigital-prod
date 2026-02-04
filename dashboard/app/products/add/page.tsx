'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, getSubCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/ProductForm';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subCategoriesRes] = await Promise.all([
        getCategories(),
        getSubCategories(),
      ]);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/products')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product in your catalog</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
        <ProductForm
          product={null}
          categories={categories}
          subCategories={subCategories}
          onSuccess={handleSuccess}
        />
    </div>
  );
}

