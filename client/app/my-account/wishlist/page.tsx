'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface Product {
  _id: string;
  itemName: string;
  yourPrice: number;
  originalPrice?: number;
  images?: string[];
  slug?: string;
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlistProducts();
  }, [wishlistItems]);

  const loadWishlistProducts = async () => {
    if (wishlistItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Load all products and filter by wishlist IDs
      const response = await getProducts({ limit: 1000 });
      const allProducts = response.data || [];
      // Filter products that are in wishlist
      const wishlistProducts = allProducts.filter((product: Product) =>
        wishlistItems.includes(product._id)
      );
      setProducts(wishlistProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      _id: product._id,
      itemName: product.itemName,
      yourPrice: product.yourPrice,
      images: product.images || [],
      quantity: 1,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
            <p className="mt-4 text-gray-600">Loading wishlist...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
            <Link
              href="/shop"
              className="inline-block bg-[#ff006e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d4005a] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <Link href={`/product/${product._id}`}>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.itemName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(product._id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${product._id}`}>
                    <h3 className="product-title mb-2 line-clamp-2 hover:text-[#ff006e] transition-colors">
                      {product.itemName}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="product-price">
                        {formatPrice(product.yourPrice)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.yourPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/product/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#ff006e] text-white rounded-lg hover:bg-[#d4005a] transition-colors text-sm font-medium"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

