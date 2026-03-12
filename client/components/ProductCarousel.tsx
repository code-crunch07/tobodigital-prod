'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart, Layers, Eye, ShoppingCart, Tag, Package, Truck, Check, X } from 'lucide-react';
import { getProducts, getNewArrivals, getSaleProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import QuickViewDialog from '@/components/QuickViewDialog';
import SaleCountdown from '@/components/SaleCountdown';
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

type DataSource = 'popular' | 'newest' | 'deals';

interface ProductCarouselProps {
  title?: string;
  description?: string;
  dataSource?: DataSource;
}

export default function ProductCarousel({ title = "Today's Popular Picks", description, dataSource = 'popular' }: ProductCarouselProps = {}) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Auto-slide: advance one card every 3s, loop back to start
  useEffect(() => {
    if (isPaused || products.length === 0) return;
    autoSlideRef.current = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 2;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = container.querySelector('.flex-shrink-0')?.getBoundingClientRect().width ?? 200;
        container.scrollBy({ left: cardWidth + 4, behavior: 'smooth' });
      }
    }, 3000);
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [isPaused, products]);

  const loadProducts = async () => {
    try {
      if (dataSource === 'newest') {
        const response = await getNewArrivals(20);
        setProducts(response.data?.products || []);
      } else if (dataSource === 'deals') {
        const response = await getSaleProducts(20);
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
    <>
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
            className="flex gap-[0.2rem] overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
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
                <div key={product._id} className="flex-shrink-0 w-[calc(50%-6px)] min-w-[calc(50%-6px)] sm:min-w-0 sm:w-[185px] md:w-[200px] lg:w-[215px] xl:w-[230px] group">
                  <div className="group relative bg-white rounded-[5px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] h-full flex flex-col border border-gray-100">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Link href={getProductUrl(product)} className="block w-full h-full">
                        {product.mainImage ? (
                          <>
                            <img src={product.mainImage} alt={product.itemName} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                            {hasHoverImage && (
                              <img src={hoverImage} alt={product.itemName} className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><Package className="h-10 w-10" /></div>
                        )}
                      </Link>
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 z-20 inline-flex items-center rounded-sm bg-[rgb(22,176,238)] text-white text-[10px] font-semibold px-2 py-0.5">-{discount}%</span>
                      )}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(product); }} className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors" title="Quick View">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className={`w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center transition-colors ${isInWishlist(product._id) ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`} title="Wishlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }}>
                          <Heart className={`h-3.5 w-3.5 ${isInWishlist(product._id) ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      {product.productCategory?.name && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">{product.productCategory.name}</span>
                      )}
                      <Link href={getProductUrl(product)}>
                        <h3 className="product-title line-clamp-2 min-h-[38px] hover:text-blue-600 transition-colors">{product.itemName}</h3>
                      </Link>
                      {product.freeShipping && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Delivery</span>
                        </div>
                      )}
                      <div className="mt-auto pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">
                            <span className="text-[15px] font-semibold text-[rgb(22,176,238)] leading-none flex-shrink-0">{formatPrice(currentPrice)}</span>
                            {discount > 0 && maxRetailPrice ? (
                              <span className="text-[11px] text-gray-400 line-through truncate">{formatPrice(maxRetailPrice)}</span>
                            ) : null}
                          </div>
                          <button type="button" onClick={(e) => handleAddToCart(e, product)} disabled={!inStock} className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 ${isAdded ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97]'}`}>
                            {isAdded ? <Check className="h-3.5 w-3.5" /> : !inStock ? <X className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {isSaleActive && saleEndDate && <SaleCountdown saleEndDate={saleEndDate} />}
                      </div>
                    </div>
                  </div>
                </div>
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

