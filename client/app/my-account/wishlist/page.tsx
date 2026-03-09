'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Trash2, Package, Truck } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { getProductUrl } from '@/lib/product-url';

interface Product {
  _id: string;
  itemName: string;
  yourPrice: number;
  originalPrice?: number;
  maximumRetailPrice?: number;
  maxRetailPrice?: number;
  mainImage?: string;
  images?: string[];
  galleryImages?: string[];
  slug?: string;
  freeShipping?: boolean;
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
      // Load all products and filter by wishlist IDs (API returns { data: { products: [...] } })
      const response = await getProducts({ limit: 1000 });
      const allProducts = response?.data?.products ?? [];
      const idList = wishlistItems.map((id) => String(id));
      const wishlistProducts = allProducts.filter((product: Product) =>
        product._id && idList.includes(String(product._id))
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
      mainImage: product.mainImage ?? product.images?.[0] ?? '',
      freeShipping: product.freeShipping ?? false,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Keep products you love in one place and add them to cart whenever you’re ready.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200 text-xs sm:text-sm text-gray-700">
            <Heart className="h-4 w-4 text-[#ff006e]" />
            <span>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item saved' : 'items saved'}
            </span>
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => {
              const maxRetailPrice = product.maximumRetailPrice || product.maxRetailPrice;
              let discount = 0;
              if (maxRetailPrice && maxRetailPrice > product.yourPrice) {
                discount = Math.round(((maxRetailPrice - product.yourPrice) / maxRetailPrice) * 100);
              }
              return (
                <div key={product._id} className="group relative bg-white rounded-[5px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] h-full flex flex-col border border-gray-100">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Link href={getProductUrl(product)} className="block w-full h-full">
                      {(product.mainImage || (product.images && product.images.length > 0)) ? (
                        <img src={product.mainImage || product.images![0]} alt={product.itemName} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><Package className="h-10 w-10" /></div>
                      )}
                    </Link>
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 z-20 inline-flex items-center rounded-sm bg-[rgb(22,176,238)] text-white text-[10px] font-semibold px-2 py-0.5">-{discount}%</span>
                    )}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <Link href={getProductUrl(product)} className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors" title="View"><Eye className="h-3.5 w-3.5" /></Link>
                      <button onClick={(e) => { e.preventDefault(); handleRemoveFromWishlist(product._id); }} className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={getProductUrl(product)}>
                      <h3 className="product-title line-clamp-2 min-h-[38px] hover:text-blue-600 transition-colors">{product.itemName}</h3>
                    </Link>
                    {product.freeShipping && (
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Delivery</span>
                      </div>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="product-price">{formatPrice(product.yourPrice)}</span>
                      </div>
                      <button onClick={() => handleAddToCart(product)} className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97] transition-all duration-200">
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

