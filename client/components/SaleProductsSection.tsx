'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Truck, Check, Eye, Heart } from 'lucide-react';
import { getSaleProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import QuickViewDialog from '@/components/QuickViewDialog';
import SaleCountdown from '@/components/SaleCountdown';
import { getProductUrl } from '@/lib/product-url';

interface Product {
  _id: string;
  itemName: string;
  mainImage: string;
  galleryImages?: string[];
  yourPrice: number;
  maximumRetailPrice?: number;
  maxRetailPrice?: number;
  salePrice?: number;
  saleStartDate?: string | Date;
  saleEndDate?: string | Date;
  stockQuantity?: number;
  productCategory?: { name: string };
  freeShipping?: boolean;
}

export default function SaleProductsSection() {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getSaleProducts(8);
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      itemName: product.itemName,
      mainImage: product.mainImage,
      yourPrice: product.yourPrice,
      freeShipping: product.freeShipping ?? false,
    });
    setAddedItems(new Set([...addedItems, product._id]));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <section className="bg-white py-10 sm:py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="border-l-4 border-t border-b border-[rgb(22,176,238)] rounded-r-lg p-6 max-w-[400px]">
            <h2 className="text-lg font-bold text-gray-900 uppercase mb-4">Sale Products</h2>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-[5px]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
    <section className="bg-white py-10 sm:py-12">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="border-l-4 border-t border-b border-[rgb(22,176,238)] rounded-r-lg p-4 sm:p-6 max-w-[420px] sm:max-w-[460px]">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
            Sale Products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {products.map((product) => {
              const maxRetailPrice = product.maximumRetailPrice || product.maxRetailPrice;
              const salePrice = product.salePrice;
              const now = new Date();
              const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
              const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
              const isSaleActive = salePrice && (!saleStart || saleStart <= now) && (!saleEnd || saleEnd >= now);
              const currentPrice = isSaleActive && salePrice && salePrice < product.yourPrice ? salePrice : product.yourPrice;
              let discount = 0;
              if (maxRetailPrice && maxRetailPrice > currentPrice) {
                discount = Math.round(((maxRetailPrice - currentPrice) / maxRetailPrice) * 100);
              }
              const isAdded = addedItems.has(product._id);
              const inStock = product.stockQuantity === undefined ? true : product.stockQuantity > 0;
              const isWishlisted = isInWishlist(product._id);

              return (
                <Link
                  key={product._id}
                  href={getProductUrl(product)}
                  className="group block"
                >
                  <div className="bg-white rounded-[5px] overflow-hidden border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt={product.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 z-10 inline-flex items-center rounded-sm bg-[rgb(22,176,238)] text-white text-[10px] font-semibold px-2 py-0.5">
                          -{discount}%
                        </span>
                      )}
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }}
                          className="w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
                          className={`w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center ${isWishlisted ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                        >
                          <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                      {product.productCategory?.name && (
                        <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-0.5">
                          {product.productCategory.name}
                        </span>
                      )}
                      <h3 className="text-[11px] sm:text-xs font-semibold text-gray-900 line-clamp-2 min-h-[32px] group-hover:text-[rgb(22,176,238)] transition-colors">
                        {product.itemName}
                      </h3>
                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
                            <span className="text-xs sm:text-sm font-semibold text-[rgb(22,176,238)] flex-shrink-0">
                              {formatPrice(currentPrice)}
                            </span>
                            {discount > 0 && maxRetailPrice && (
                              <span className="text-[10px] text-gray-400 line-through truncate">
                                {formatPrice(maxRetailPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={!inStock}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                              isAdded ? 'bg-emerald-500 text-white' : 'bg-[rgb(22,176,238)] text-white hover:opacity-90'
                            }`}
                          >
                            {isAdded ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {!!isSaleActive && !!saleEnd && <SaleCountdown saleEndDate={saleEnd} />}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    {quickViewProduct && (
      <QuickViewDialog
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        formatPrice={formatPrice}
      />
    )}
    </>
  );
}
