'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { getProducts, getUploadUrl } from '@/lib/api';

export default function ClientHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await getProducts({ limit: 8, featured: true });
      setFeaturedProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-blue-400 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{' '}
              <span className="text-pink-200">tobo</span>
              <span className="text-blue-200">digital</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover amazing products at unbeatable prices. Shop the latest trends and find everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/client/shop">
                <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-100">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/client/new-arrivals">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Discover our handpicked selection</p>
            </div>
            <Link href="/client/shop">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product._id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/client/products/${product._id}`}>
                    <div className="aspect-square relative overflow-hidden bg-muted">
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
                    <CardContent className="p-4">
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
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our wide range of categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Electronics', image: 'https://via.placeholder.com/300x200', href: '/client/shop?category=electronics' },
              { name: 'Fashion', image: 'https://via.placeholder.com/300x200', href: '/client/shop?category=fashion' },
              { name: 'Home & Living', image: 'https://via.placeholder.com/300x200', href: '/client/shop?category=home' },
              { name: 'Sports', image: 'https://via.placeholder.com/300x200', href: '/client/shop?category=sports' },
            ].map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-blue-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Get the latest updates on new products, special offers, and exclusive deals delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
