'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart, Layers, Eye, ShoppingCart, Tag } from 'lucide-react';
import { getProducts, getNewArrivals } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

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

    const cardWidth = 280; // Approximate card width
    const gap = 24;
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
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
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
              const buttonClass = 'bg-[rgb(17,24,39)] hover:bg-[rgb(15,23,42)]';

              return (
                <div key={product._id} className="flex-shrink-0 w-[220px] md:w-[240px] group">
                  <div className="group relative bg-white border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <Link href={`/product/${product._id}`} className="block w-full h-full">
                        {product.mainImage ? (
                          <>
                            <img src={product.mainImage} alt={product.itemName} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                            {hasHoverImage && (
                              <img src={hoverImage} alt={product.itemName} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <span className="text-sm">No Image</span>
                          </div>
                        )}
                      </Link>
                      {discount > 0 ? (
                        <div className="absolute top-0 left-0 z-20">
                          <span
                            className="flex items-center gap-1.5 bg-[#ff006e] text-white text-xs font-semibold pl-2 pr-3 py-1.5 shadow-md"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                          >
                            <Tag className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                            <span>{discount}% off</span>
                          </span>
                        </div>
                      ) : null}
                      {product.isFeatured && (
                        <div className="absolute left-0 z-20" style={{ top: discount > 0 ? '2.25rem' : 0 }}>
                          <span
                            className="inline-flex items-center bg-[#ff006e] text-white text-xs font-semibold px-2.5 py-1 shadow-md"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                          >
                            Hot
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 z-20">
                        <button type="button" className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Add to Wishlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <Heart className="h-4 w-4" />
                        </button>
                        <button type="button" className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Compare" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <Layers className="h-4 w-4" />
                        </button>
                        <Link href={`/product/${product._id}`} className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Quick View" onClick={(e) => e.stopPropagation()}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    <div className="px-5 pb-14 pt-4 flex-1 flex flex-col min-h-0 transition-transform duration-300 group-hover:-translate-y-3">
                      <Link href={`/product/${product._id}`}>
                        <h3 className="product-title leading-snug line-clamp-2 min-h-[20px] hover:text-[#ff006e] transition-colors">{product.itemName}</h3>
                      </Link>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center text-[#f5a623] text-sm leading-none">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'fill-[#f5a623] text-[#f5a623]' : 'fill-gray-200 text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">2 reviews</span>
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="product-price">{formatPrice(currentPrice)}</span>
                        {maxRetailPrice && maxRetailPrice > currentPrice && (
                          <span className="text-sm text-gray-400 line-through">{formatPrice(maxRetailPrice)}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className={inStock ? 'text-green-600' : 'text-red-600'}>✓</span>
                        <span className={inStock ? 'text-green-600' : 'text-red-600'}>{inStock ? 'In stock' : 'Out of stock'}</span>
                      </div>
                    </div>
                    <div className={`absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100 transition-transform duration-300 ${isAdded ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                      <button type="button" onClick={(e) => handleAddToCart(e, product)} disabled={!inStock} className={`w-full rounded-full ${buttonClass} text-white text-sm font-semibold py-3 disabled:opacity-60 transition-colors`}>
                        {isAdded ? (
                          <span className="flex items-center justify-center gap-2"><span>✓</span><span>Added to Cart</span></span>
                        ) : (
                          <span className="flex items-center justify-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Add To Cart</span></span>
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

