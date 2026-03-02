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
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - modern */}
      <div className="rounded-none border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/products')}
            className="gap-2 rounded-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create a new product in your catalog</p>
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

