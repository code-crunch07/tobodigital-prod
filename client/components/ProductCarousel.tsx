'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart, Layers, Eye, ShoppingCart, Tag, Package } from 'lucide-react';
import { getProducts, getNewArrivals } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { getProductUrl } from '@/lib/product-url';

interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  galleryImages?: string[];
  yourPrice: number;
  maximumRetailPrice?: number;
  maxRetailPrice?: number;
  salePrice?: number;
  saleStartDate?: string | Date;
  saleEndDate?: string | Date;
  isFeatured?: boolean;
  stockQuantity?: number;
  productCategory?: {
    name: string;
  };
  freeShipping?: boolean;
}

type DataSource = 'popular' | 'newest';

interface ProductCarouselProps {
  title?: string;
  description?: string;
  dataSource?: DataSource;
}

export default function ProductCarousel({ title = "Today's Popular Picks", description, dataSource = 'popular' }: ProductCarouselProps = {}) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, [dataSource]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    };

    checkScrollability();
    container.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [products]);

  const loadProducts = async () => {
    try {
      if (dataSource === 'newest') {
        const response = await getNewArrivals(20);
        setProducts(response.data?.products || []);
      } else {
        const response = await getProducts({ limit: 20, sort: 'popular' });
        setProducts(response.data?.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const gap = 16;
    const cardWidth = container.querySelector('.flex-shrink-0')?.getBoundingClientRect().width ?? 200;
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <section className="bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header with Title and Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-gray-600 text-sm sm:text-base max-w-2xl">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex items-center justify-center disabled:text-gray-300 text-gray-800 hover:text-gray-900 transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex items-center justify-center disabled:text-gray-300 text-gray-900 hover:text-black transition-colors"
              aria-label="Next products"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              let discount = 0;
              const maxRetailPrice = product.maximumRetailPrice || product.maxRetailPrice;
              const salePrice = product.salePrice;
              const now = new Date();
              const saleStartDate = product.saleStartDate ? new Date(product.saleStartDate) : null;
              const saleEndDate = product.saleEndDate ? new Date(product.saleEndDate) : null;
              const isSaleActive = salePrice && (!saleStartDate || saleStartDate <= now) && (!saleEndDate || saleEndDate >= now);
              const currentPrice = isSaleActive && salePrice < product.yourPrice ? salePrice : product.yourPrice;
              if (maxRetailPrice && maxRetailPrice > currentPrice) {
                discount = Math.round(((maxRetailPrice - currentPrice) / maxRetailPrice) * 100);
              } else if (isSaleActive && salePrice < product.yourPrice && maxRetailPrice) {
                discount = Math.round(((maxRetailPrice - salePrice) / maxRetailPrice) * 100);
              }
              const isAdded = addedItems.has(product._id);
              const hoverImage = (product.galleryImages?.length && product.galleryImages[0]) ? product.galleryImages[0] : product.mainImage;
              const hasHoverImage = product.galleryImages?.length && product.galleryImages[0] && product.galleryImages[0] !== product.mainImage;
              const inStock = product.stockQuantity !== undefined ? product.stockQuantity > 0 : true;

              return (
                <div key={product._id} className="flex-shrink-0 w-[calc(50%-6px)] min-w-[calc(50%-6px)] sm:min-w-0 sm:w-[190px] md:w-[210px] group">
                  <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] h-full flex flex-col border border-gray-100">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Link href={getProductUrl(product)} className="block w-full h-full">
                        {product.mainImage ? (
                          <>
                            <img src={product.mainImage} alt={product.itemName} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110" />
                            {hasHoverImage && (
                              <img src={hoverImage} alt={product.itemName} className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                      </Link>
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                        {discount > 0 && (
                          <span className="inline-flex items-center rounded-lg bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 shadow-sm">
                            -{discount}%
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex items-center rounded-lg bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 shadow-sm">
                            Hot
                          </span>
                        )}
                      </div>
                      <button type="button" className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm flex items-center justify-center transition-all duration-200" title="Add to Wishlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Heart className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 bg-gradient-to-t from-black/20 to-transparent">
                        <Link href={getProductUrl(product)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200" title="Quick View" onClick={(e) => e.stopPropagation()}>
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button type="button" className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200" title="Compare" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <Layers className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      {product.productCategory?.name && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                          {product.productCategory.name}
                        </span>
                      )}
                      <Link href={getProductUrl(product)}>
                        <h3 className="product-title line-clamp-2 min-h-[36px] hover:text-[#ff006e] transition-colors">
                          {product.itemName}
                        </h3>
                      </Link>
                      <div className="mt-auto pt-3 flex items-baseline gap-2">
                        <span className="product-price">{formatPrice(currentPrice)}</span>
                        {maxRetailPrice && maxRetailPrice > currentPrice && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(maxRetailPrice)}</span>
                        )}
                      </div>
                      <button type="button" onClick={(e) => handleAddToCart(e, product)} disabled={!inStock} className={`mt-3 w-full rounded-xl text-sm font-semibold py-2.5 transition-all duration-200 disabled:opacity-50 ${isAdded ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'}`}>
                        {isAdded ? (
                          <span className="flex items-center justify-center gap-2"><span>✓</span><span>Added</span></span>
                        ) : !inStock ? (
                          <span>Out of Stock</span>
                        ) : (
                          <span className="flex items-center justify-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Add to Cart</span></span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

