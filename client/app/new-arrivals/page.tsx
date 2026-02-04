'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { getNewArrivals } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  yourPrice: number;
  maximumRetailPrice?: number;
}

export default function NewArrivalsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getNewArrivals(20);
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg animate-pulse h-96"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <Link href={`/product/${product._id}`}>
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.itemName}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      NEW
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">{product.brandName}</p>
                  <Link href={`/product/${product._id}`}>
                    <h3 className="product-title mb-2 hover:text-[#ff006e] transition-colors line-clamp-2">
                      {product.itemName}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="product-price">
                        {formatPrice(product.yourPrice)}
                      </span>
                      {product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.maximumRetailPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          _id: product._id,
                          itemName: product.itemName,
                          mainImage: product.mainImage,
                          yourPrice: product.yourPrice,
                        });
                        setAddedItems(new Set([...addedItems, product._id]));
                        setTimeout(() => {
                          setAddedItems((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(product._id);
                            return newSet;
                          });
                        }, 2000);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        addedItems.has(product._id)
                          ? 'bg-green-500 text-white'
                          : 'bg-[#ff006e] text-white hover:bg-[#d4005a]'
                      }`}
                    >
                      {addedItems.has(product._id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No new arrivals available</div>
        )}
      </div>
    </div>
  );
}
