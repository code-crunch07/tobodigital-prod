'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { getPublicProducts } from '@/lib/api-public';
import { getUploadUrl } from '@/lib/api';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: searchParams.get('page') || '1',
        limit: '12',
      };

      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('featured')) params.featured = searchParams.get('featured');
      if (searchParams.get('sale')) params.sale = searchParams.get('sale');
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('sort')) params.sort = searchParams.get('sort');
      if (searchParams.get('price')) params.price = searchParams.get('price');

      const response = await getPublicProducts(params);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">
            Showing {products.length} of {pagination.total || 0} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'space-y-6'
            }
          >
            {products.map((product) => (
              <Card
                key={product._id}
                className={`group overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <Link href={`/client/products/${product._id}`}>
                  <div
                    className={`${
                      viewMode === 'list' ? 'w-48' : 'w-full'
                    } aspect-square relative overflow-hidden bg-muted`}
                  >
                    {product.mainImage ? (
                      <Image
                        src={getUploadUrl(product.mainImage)}
                        alt={product.itemName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {product.salePrice && product.salePrice < product.yourPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Sale
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-semibold mb-1 line-clamp-2">{product.itemName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.brandName}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold">
                      ${product.salePrice || product.yourPrice}
                    </span>
                    {product.salePrice && product.salePrice < product.yourPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.yourPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(24)</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Link key={page} href={`/client/shop?page=${page}`}>
                  <Button
                    variant={pagination.page === page ? 'default' : 'outline'}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
