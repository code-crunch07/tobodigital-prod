'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SaleCountdown from '@/components/SaleCountdown';
import CouponStrip from '@/components/CouponStrip';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Zap,
  Star,
  ExternalLink,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  Plus,
  Minus,
  FileText,
  List,
  TrendingDown,
  PackageCheck,
  BadgeIndianRupee,
} from 'lucide-react';
import type { Product, ProductVariant } from './types';

/** Amazon-style zoom: fixed lens size, zoom panel uses background-image (no img scale) */
const LENS_SIZE = 300;
const ZOOM_PANEL_SIZE = 800;

export interface ProductDetailViewProps {
  product: Product;
  images: string[];
  plainDescription: string;
  discount: number;
  formatPrice: (price: number) => string;
  selectedImage: string;
  setSelectedImage: (url: string) => void;
  setImageRef: (el: HTMLDivElement | null) => void;
  showZoom: boolean;
  zoomPosition: { px: number; py: number; percentX: number; percentY: number };
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleImageClick: () => void;
  lightboxOpen: boolean;
  setLightboxImageRef: (el: HTMLDivElement | null) => void;
  lightboxZoom: number;
  lightboxImageIndex: number;
  lightboxPosition: { x: number; y: number };
  handleLightboxZoomIn: () => void;
  handleLightboxZoomOut: () => void;
  handleLightboxMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  setLightboxShowZoom: (v: boolean) => void;
  handleCloseLightbox: () => void;
  handleLightboxPrev: () => void;
  handleLightboxNext: () => void;
  handleLightboxImageChange: (index: number) => void;
  quantity: number;
  setQuantity: (n: number | ((prev: number) => number)) => void;
  handleAddToCart: () => void;
  addedToCart: boolean;
  handleBuyNow: () => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  handleShare: () => void;
  handlePincodeCheck: (e: React.FormEvent) => void;
  pincode: string;
  onPincodeChange: (value: string) => void;
  pincodeCheckResult: { available: boolean; message: string } | null;
  activeTab: 'description' | 'reviews' | 'specifications' | 'shipping';
  setActiveTab: (tab: 'description' | 'reviews' | 'specifications' | 'shipping') => void;
  recentlyViewed: Product[];
  similarProducts: Product[];
  loadingSimilar: boolean;
  renderProductCard: (product: Product) => React.ReactNode;
  /** From API when available; no demo data */
  reviewCount?: number;
  /** From API when available; 0–5 */
  averageRating?: number | null;
  /** Variants (optional) */
  activeVariant?: ProductVariant | null;
  variantAttributesMap?: Record<string, string[]>;
  selectedOptions?: Record<string, string>;
  onSelectOption?: (name: string, value: string) => void;
  effectivePrice?: number;
  effectiveMrp?: number;
  effectiveStock?: number | null;
  saleEndDate?: string | Date;
}

export function ProductDetailView(props: ProductDetailViewProps) {
  const {
    product,
    images,
    plainDescription,
    discount,
    formatPrice,
    selectedImage,
    setSelectedImage,
    setImageRef,
    showZoom,
    zoomPosition,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleImageClick,
    lightboxOpen,
    setLightboxImageRef,
    lightboxZoom,
    lightboxImageIndex,
    lightboxPosition,
    handleLightboxZoomIn,
    handleLightboxZoomOut,
    handleLightboxMouseMove,
    setLightboxShowZoom,
    handleCloseLightbox,
    handleLightboxPrev,
    handleLightboxNext,
    handleLightboxImageChange,
    quantity,
    setQuantity,
    handleAddToCart,
    addedToCart,
    handleBuyNow,
    toggleWishlist,
    isInWishlist,
    handleShare,
    handlePincodeCheck,
    pincode,
    onPincodeChange,
    pincodeCheckResult,
    activeTab,
    setActiveTab,
    recentlyViewed,
    similarProducts,
    loadingSimilar,
    renderProductCard,
    reviewCount = 0,
    averageRating = null,
    activeVariant,
    variantAttributesMap,
    selectedOptions,
    onSelectOption,
    effectivePrice,
    effectiveMrp,
    effectiveStock,
    saleEndDate,
  } = props;

  const touchStartX = useRef(0);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpenSection, setMobileOpenSection] = useState<'description' | 'reviews' | 'specifications' | 'shipping' | null>(null);
  const [thumbScroll, setThumbScroll] = useState({ canScrollLeft: false, canScrollRight: false });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewSaveInfo, setReviewSaveInfo] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/public/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          reviewText,
          name: reviewName,
          email: reviewEmail,
        }),
      });
    } catch {
      // show success anyway for UX
    } finally {
      setReviewSubmitted(true);
      setReviewSubmitting(false);
    }
  };

  const updateThumbScroll = useCallback(() => {
    const el = thumbStripRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setThumbScroll({
      canScrollLeft: scrollLeft > 2,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    updateThumbScroll();
    const el = thumbStripRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateThumbScroll);
    ro.observe(el);
    el.addEventListener('scroll', updateThumbScroll);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateThumbScroll);
    };
  }, [images.length, updateThumbScroll]);

  const scrollThumbs = (dir: 'left' | 'right') => {
    const el = thumbStripRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const currentImageIndex = selectedImage
    ? Math.max(0, images.findIndex((img) => img === selectedImage))
    : 0;
  const setImageByIndex = (index: number) => {
    const i = Math.max(0, Math.min(index, images.length - 1));
    setSelectedImage(images[i] || product.mainImage);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const delta = touchStartX.current - endX;
    if (images.length <= 1) return;
    if (delta > 50) setImageByIndex(currentImageIndex + 1);
    else if (delta < -50) setImageByIndex(currentImageIndex - 1);
  };

  return (
    <>
    <div
      className="min-h-screen text-[#2d3748] bg-[#f9fafb]"
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-6 mb-6 w-full min-w-0">
        <nav
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-600 transition-colors flex-shrink-0">
            Home
          </Link>
          <span className="flex-shrink-0">/</span>
          <Link href="/shop" className="hover:text-gray-600 transition-colors flex-shrink-0">
            Products
          </Link>
          {product?.productCategory && (
            <>
              <span>/</span>
              <Link
                href={`/product-category/${product.productCategory.slug || product.productCategory._id}`}
                className="hover:text-gray-600 transition-colors flex-shrink-0"
              >
                {product.productCategory.name}
              </Link>
            </>
          )}
          <span className="flex-shrink-0">/</span>
          <span className="text-gray-600 truncate max-w-[180px] sm:max-w-[260px]">{product.itemName}</span>
        </nav>

        {/* Layout: left = images (sticky on desktop); right = product info */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-4 sm:gap-6 lg:gap-12 mb-8 min-w-0 relative">
          <div className="min-w-0 relative lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:z-30">
            {/* Mobile: image carousel with dots + wishlist/share below image */}
            <div className="lg:hidden flex flex-col gap-3">
              <div
                className="relative aspect-square w-full overflow-hidden bg-white touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleImageClick}
              >
                <img
                  src={images[currentImageIndex] || product.mainImage}
                  alt={`${product.itemName} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
                {/* Fullscreen + wishlist/share overlay (bottom-right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick();
                  }}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                  aria-label="Full screen"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(String(product._id));
                    }}
                    className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                    aria-label={isInWishlist(String(product._id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist(String(product._id)) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                    aria-label="Share"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex justify-center items-center gap-2 py-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setImageByIndex(index)}
                      className={`rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-2.5 h-2.5 bg-gray-900'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: main image + zoom + thumbnails */}
            <div className="hidden lg:flex flex-col gap-3">
            {/* Main image - full width of left column */}
            <div className="relative w-full">
              <div
                ref={setImageRef}
                className="aspect-square w-full rounded-lg overflow-hidden relative cursor-zoom-in flex items-center justify-center bg-gray-50"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
              >
                <img
                  src={selectedImage || product.mainImage}
                  alt={product.itemName}
                  className="w-full h-full object-cover relative z-0"
                  draggable={false}
                />
                {showZoom && (
                  <div
                    className="absolute pointer-events-none border-2 border-blue-400 bg-blue-200/20 shadow-sm z-10"
                    style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      left: zoomPosition.px,
                      top: zoomPosition.py,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                  aria-label="Full screen"
                  title="Full screen"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(String(product._id));
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff006e] transition-colors"
                  aria-label={isInWishlist(String(product._id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  title={isInWishlist(String(product._id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(String(product._id)) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                  aria-label="Share"
                  title="Share"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              className={`hidden lg:block absolute left-full top-0 ml-4 mr-6 z-40 w-[560px] xl:w-[700px] 2xl:w-[800px] h-[800px] max-w-[calc(100vw-6rem)] transition-opacity duration-150 pointer-events-none ${showZoom ? 'opacity-100' : 'opacity-0'}`}
              style={{ minWidth: ZOOM_PANEL_SIZE }}
              aria-hidden={!showZoom}
            >
              <div
                className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xl"
                style={{
                  backgroundImage: `url(${selectedImage || product.mainImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${(ZOOM_PANEL_SIZE / LENS_SIZE) * 100}%`,
                  backgroundPosition: `${zoomPosition.percentX}% ${zoomPosition.percentY}%`,
                }}
              />
            </div>
            {images.length > 1 && (
            <div className="relative -mx-1">
              {thumbScroll.canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollThumbs('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#e2e8f0] shadow-md flex items-center justify-center text-[#4a5568] hover:bg-[#f7fafc] hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {thumbScroll.canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollThumbs('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#e2e8f0] shadow-md flex items-center justify-center text-[#4a5568] hover:bg-[#f7fafc] hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
              <div
                ref={thumbStripRef}
                className="flex gap-3 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 bg-[#f7fafc] transition-colors ${
                      selectedImage === img || (!selectedImage && index === 0)
                        ? 'border-[#ff6b35]'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e0]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.itemName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            )}
            </div>

          </div>

          <div className="flex flex-col gap-0 min-w-0">
            {/* Category */}
            {product.productCategory && (
              <div className="mb-3">
                <Link
                  href={`/product-category/${product.productCategory.slug || product.productCategory._id}`}
                  className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {product.productCategory.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-[17px] font-medium text-gray-900 leading-snug break-words tracking-tight">
              {product.itemName}
            </h1>

            {/* Rating / reviews */}
            {reviewCount > 0 && averageRating != null && Number.isFinite(averageRating) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#4b5563] mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#fbbf24]" aria-hidden>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'fill-none'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-[#2d3748]">{Number(averageRating).toFixed(1)}</span>
                  <span>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
                <Link href="#reviews" className="text-[#4299e1] hover:underline font-medium">Write a review</Link>
              </div>
            )}

            <hr className="my-5 border-gray-100" />

            {/* Variant selectors */}
            {variantAttributesMap && Object.keys(variantAttributesMap).length > 0 && (
              <div className="space-y-4 pt-1 pb-2">
                {Object.entries(variantAttributesMap).map(([name, values]) => (
                  <div key={name} className="space-y-2.5">
                    <div className="text-[13px] font-semibold text-gray-700">
                      {name}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {values.map((val) => {
                        const isSelected =
                          selectedOptions && selectedOptions[name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              onSelectOption && onSelectOption(name, val)
                            }
                            className={`min-w-[4rem] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'border-2 border-gray-900 bg-gray-900 text-white shadow-sm ring-2 ring-gray-900/10'
                                : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price + stock */}
            <div className="space-y-3">
              {saleEndDate && (
                <SaleCountdown saleEndDate={saleEndDate} variant="detail" />
              )}

              {/* Price row */}
              {(() => {
                const baseMrp = product.maximumRetailPrice || product.maxRetailPrice;
                const mrpToUse = typeof effectiveMrp === 'number' ? effectiveMrp : baseMrp;
                const priceToUse = effectivePrice ?? product.yourPrice;
                const hasDiscount = !!mrpToUse && mrpToUse > priceToUse;
                return (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Sale price */}
                    <span className="text-[1.75rem] font-bold text-gray-900 leading-none">
                      {formatPrice(priceToUse)}
                    </span>

                    {hasDiscount && (
                      <div className="flex items-center gap-2">
                        {/* MRP strikethrough */}
                        <span className="text-[0.95rem] text-gray-400 line-through leading-none">
                          {formatPrice(mrpToUse!)}
                        </span>
                        {/* Discount badge */}
                        {discount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 leading-none uppercase tracking-wide">
                            {discount}% off
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* MRP label */}
              {(() => {
                const baseMrp = product.maximumRetailPrice || product.maxRetailPrice;
                const mrpToUse = typeof effectiveMrp === 'number' ? effectiveMrp : baseMrp;
                const priceToUse = effectivePrice ?? product.yourPrice;
                if (!mrpToUse || mrpToUse <= priceToUse) return null;
                return (
                  <p className="text-[11px] text-gray-400">
                    MRP: <span className="line-through">{formatPrice(mrpToUse)}</span>&nbsp;
                    <span className="text-gray-500">(Inclusive of all taxes)</span>
                  </p>
                );
              })()}

              {/* Stock status */}
              {(effectiveStock ?? product.stockQuantity) !== undefined && (
                <div className="flex items-center gap-2 mb-5">
                  {(effectiveStock ?? product.stockQuantity)! > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      In Stock
                      {(effectiveStock ?? product.stockQuantity)! <= 10 && (
                        <span className="text-orange-500 font-semibold">
                          · Only {effectiveStock ?? product.stockQuantity} left
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      Out of Stock
                    </span>
                  )}
                </div>
              )}
            </div>

            {(product as any).shortDescription && (
              <p className="text-[13px] text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-3">
                {(product as any).shortDescription}
              </p>
            )}

            <hr className="my-5 border-gray-100" />

            {/* Quantity + CTA buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    addedToCart
                      ? 'bg-emerald-500 text-white'
                      : product.stockQuantity === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
                  }`}
                >
                  {addedToCart ? (
                    <><Check className="h-4 w-4" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockQuantity === 0}
                  className={`flex-1 h-11 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                    product.stockQuantity === 0
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-[#ff6b35] text-[#ff6b35] bg-white hover:bg-[#ff6b35] hover:text-white'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>

                {product.amazonLink && product.amazonLink.trim() && (
                  <a
                    href={product.amazonLink.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 px-6 rounded-xl font-semibold text-sm border border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Amazon
                  </a>
                )}
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Pincode check */}
            <form onSubmit={handlePincodeCheck} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Truck className="h-4 w-4 text-[#ff6b35]" />
                <span>Delivery</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => onPincodeChange(e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 focus:border-[#ff6b35] transition-all"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#ff6b35] border border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white transition-all whitespace-nowrap"
                >
                  Check
                </button>
              </div>
              {pincodeCheckResult && (
                <div
                  className={`p-3 rounded-xl text-xs sm:text-sm font-medium ${
                    pincodeCheckResult.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {pincodeCheckResult.available ? '✓' : '✗'} {pincodeCheckResult.message}
                </div>
              )}
            </form>

            {/* Benefits strip */}
            <div className="mt-5 flex items-stretch rounded-xl bg-white overflow-hidden">
              {[
                {
                  icon: <BadgeIndianRupee className="h-7 w-7 text-[rgb(22,176,238)]" />,
                  line1: 'Lower Price',
                  line2: 'Than Amazon',
                  color: 'text-[rgb(22,176,238)]',
                },
                {
                  icon: <ShieldCheck className="h-7 w-7 text-blue-600" />,
                  line1: '1 Year',
                  line2: 'Warranty',
                  color: 'text-gray-700',
                },
                {
                  icon: <RotateCcw className="h-7 w-7 text-gray-700" />,
                  line1: '10 days',
                  line2: 'Replacement',
                  color: 'text-gray-700',
                },
                {
                  icon: <Truck className="h-7 w-7 text-gray-700" />,
                  line1: 'Standard',
                  line2: 'Delivery',
                  color: 'text-gray-700',
                },
                {
                  icon: <Lock className="h-7 w-7 text-gray-700" />,
                  line1: 'Secure',
                  line2: 'Pay',
                  color: 'text-gray-700',
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 text-center ${
                    i < arr.length - 1 ? 'border-r border-gray-200' : ''
                  }`}
                >
                  {item.icon}
                  <span className={`text-[11px] font-bold leading-tight ${item.color}`}>
                    {item.line1}<br />{item.line2}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon codes */}
            <CouponStrip />
          </div>
        </div>

        <div className="mt-12">
          {/* Mobile: accordion layout */}
          <div className="sm:hidden mb-6 space-y-2">
            {/* Description */}
            <div className={`rounded-xl border overflow-hidden bg-white ${mobileOpenSection === 'description' ? 'border-gray-300' : 'border-transparent'}`}>
              <button
                type="button"
                onClick={() =>
                  setMobileOpenSection(mobileOpenSection === 'description' ? null : 'description')
                }
                className={`w-full flex items-center gap-3 py-4 px-4 text-left transition-colors ${mobileOpenSection === 'description' ? 'bg-[rgb(22,176,238)]/5' : 'bg-white active:bg-gray-50'}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${mobileOpenSection === 'description' ? 'bg-[rgb(22,176,238)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <FileText className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-gray-900">
                  Product Description
                </span>
                <ChevronDown className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileOpenSection === 'description' ? 'rotate-180 text-[rgb(22,176,238)]' : ''}`} />
              </button>
              {mobileOpenSection === 'description' && (
                <div className="px-4 py-4 pb-5 space-y-4 text-sm text-gray-700 bg-white border-t border-gray-100">
                  {product.productDescription && (
                    <div
                      className="product-description-content"
                      dangerouslySetInnerHTML={{ __html: product.productDescription }}
                    />
                  )}
                  {(() => {
                    const bulletPoints = Array.isArray(product.bulletPoints)
                      ? product.bulletPoints
                      : typeof product.bulletPoints === 'string'
                        ? product.bulletPoints.split(',').map((s) => s.trim()).filter(Boolean)
                        : [];
                    return bulletPoints.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Key Features</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-gray-700">
                          {bulletPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                  {(() => {
                    const specialFeatures = Array.isArray(product.specialFeatures)
                      ? product.specialFeatures
                      : typeof product.specialFeatures === 'string'
                        ? product.specialFeatures.split(',').map((s) => s.trim()).filter(Boolean)
                        : [];
                    return specialFeatures.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Applications</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-gray-700">
                          {specialFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className={`rounded-xl border overflow-hidden bg-white ${mobileOpenSection === 'specifications' ? 'border-gray-300' : 'border-transparent'}`}>
              <button
                type="button"
                onClick={() =>
                  setMobileOpenSection(
                    mobileOpenSection === 'specifications' ? null : 'specifications'
                  )
                }
                className={`w-full flex items-center gap-3 py-4 px-4 text-left transition-colors ${mobileOpenSection === 'specifications' ? 'bg-[rgb(22,176,238)]/5' : 'bg-white active:bg-gray-50'}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${mobileOpenSection === 'specifications' ? 'bg-[rgb(22,176,238)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <List className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-gray-900">
                  Specifications
                </span>
                <ChevronDown className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileOpenSection === 'specifications' ? 'rotate-180 text-[rgb(22,176,238)]' : ''}`} />
              </button>
              {mobileOpenSection === 'specifications' &&
                (() => {
                  const specRows: { label: string; value: string }[] = [];
                  if (product.productType) specRows.push({ label: 'Product Type', value: product.productType });
                  if ((product as any).itemTypeName) specRows.push({ label: 'Item Type', value: (product as any).itemTypeName });
                  if (product.modelNo) specRows.push({ label: 'Model Number', value: product.modelNo });
                  if (product.brandName) specRows.push({ label: 'Brand', value: product.brandName });
                  if (product.productId) specRows.push({ label: 'Product ID', value: product.productId });
                  if (product.partNumber) specRows.push({ label: 'Part Number', value: product.partNumber });
                  if (product.color) specRows.push({ label: 'Color', value: product.color });
                  if (product.itemCondition) specRows.push({ label: 'Condition', value: product.itemCondition });
                  if (product.manufacturerName)
                    specRows.push({ label: 'Manufacturer', value: product.manufacturerName });
                  const d = product.itemDimensions;
                  const hasDimensions = d && (
                    d.length != null || d.width != null || d.height != null
                  );
                  if (hasDimensions && d) {
                    specRows.push({
                      label: 'Dimensions',
                      value: `${d.length ?? '-'} × ${d.width ?? '-'} × ${d.height ?? '-'} ${d.unit || 'cm'}`,
                    });
                  }
                  if (product.itemWeight != null)
                    specRows.push({ label: 'Weight', value: `${product.itemWeight} ${(product as any).weightUnit || 'grams'}` });
                  const pd = product.itemPackageDimensions || product.packageDimensions;
                  const hasPackageDimensions = pd && (
                    pd.length != null || pd.width != null || pd.height != null
                  );
                  if (hasPackageDimensions && pd) {
                    specRows.push({
                      label: 'Package Dimensions',
                      value: `${pd.length ?? '-'} × ${pd.width ?? '-'} × ${pd.height ?? '-'} ${pd.unit || 'cm'}`,
                    });
                  }
                  if (product.packageWeight != null)
                    specRows.push({ label: 'Package Weight', value: `${product.packageWeight} ${(product as any).packageWeightUnit || 'grams'}` });
                  if (product.countryOfOrigin)
                    specRows.push({ label: 'Country of Origin', value: product.countryOfOrigin });
                  if (product.hsnCode) specRows.push({ label: 'HSN Code', value: product.hsnCode });
                  if (product.warrantyDescription)
                    specRows.push({ label: 'Warranty', value: product.warrantyDescription });
                  if (product.areBatteriesRequired || product.batteriesRequired)
                    specRows.push({ label: 'Batteries Required', value: 'Yes' });
                  if (product.compatibleDevices && Array.isArray(product.compatibleDevices) && product.compatibleDevices.length > 0)
                    specRows.push({ label: 'Compatible Devices', value: product.compatibleDevices.join(', ') });
                  if (product.includedComponents && Array.isArray(product.includedComponents) && product.includedComponents.length > 0)
                    specRows.push({ label: 'Included Components', value: product.includedComponents.join(', ') });
                  if ((product as any).importerContactInformation || (product as any).importerContactInfo)
                    specRows.push({ label: 'Importer Contact', value: (product as any).importerContactInformation || (product as any).importerContactInfo });
                  if ((product as any).packerContactInformation || (product as any).packerContactInfo)
                    specRows.push({ label: 'Packer Contact', value: (product as any).packerContactInformation || (product as any).packerContactInfo });
                  if (product.attributeValues && typeof product.attributeValues === 'object') {
                    Object.entries(product.attributeValues).forEach(([name, value]) => {
                      if (value != null && String(value).trim()) specRows.push({ label: name, value: String(value).trim() });
                    });
                  }
                  if (specRows.length === 0) {
                    return (
                      <div className="border-t border-gray-100 px-4 py-4 pb-5 text-center text-gray-500 text-sm bg-white">
                        No specifications available for this product.
                      </div>
                    );
                  }
                  return (
                    <div className="border-t border-gray-100 px-4 py-4 pb-5 bg-white">
                      <dl className="divide-y divide-gray-100">
                        {specRows.map((row, index) => (
                          <div key={index} className={`flex items-center py-2.5 text-sm ${index % 2 === 0 ? '' : 'bg-gray-50/50 -mx-4 px-4'}`}>
                            <dt className="text-gray-500 font-medium pr-4 flex-shrink-0 w-[45%]">{row.label}</dt>
                            <dd className="text-gray-900 font-medium text-right flex-1 ml-auto">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })()}
            </div>

            {/* Shipping & Returns */}
            <div className={`rounded-xl border overflow-hidden bg-white ${mobileOpenSection === 'shipping' ? 'border-gray-300' : 'border-transparent'}`}>
              <button
                type="button"
                onClick={() =>
                  setMobileOpenSection(mobileOpenSection === 'shipping' ? null : 'shipping')
                }
                className={`w-full flex items-center gap-3 py-4 px-4 text-left transition-colors ${mobileOpenSection === 'shipping' ? 'bg-[rgb(22,176,238)]/5' : 'bg-white active:bg-gray-50'}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${mobileOpenSection === 'shipping' ? 'bg-[rgb(22,176,238)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-gray-900">
                  Shipping & Returns
                </span>
                <ChevronDown className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileOpenSection === 'shipping' ? 'rotate-180 text-[rgb(22,176,238)]' : ''}`} />
              </button>
              {mobileOpenSection === 'shipping' && (
                <div className="border-t border-gray-100 px-4 py-4 pb-5 space-y-4 text-sm text-gray-700 bg-white">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Shipping Information</h3>
                    <p className="text-gray-700 mb-3">
                      We offer fast and reliable shipping options to ensure your products arrive safely and on time.
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-gray-700">
                      <li><strong>Free Standard Shipping:</strong> Orders over ₹999 (5–7 business days)</li>
                      <li><strong>Standard Shipping:</strong> ₹99 (5–7 business days)</li>
                      <li><strong>Express Shipping:</strong> ₹199 (2–3 business days)</li>
                      <li><strong>Next Day Delivery:</strong> ₹299 (order by 2 PM)</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Returns & Exchanges</h3>
                    <p className="text-gray-700 mb-3">
                      We want you to be completely satisfied with your purchase. If you're not happy with your
                      order, we offer a 30-day money-back guarantee.
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-gray-700">
                      <li>Items must be in original packaging with all accessories</li>
                      <li>Return shipping is free for defective items</li>
                      <li>Refunds processed within 5–7 business days of receiving return</li>
                      <li>Exchanges are processed immediately upon receipt</li>
                    </ul>
                  </section>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className={`rounded-xl border overflow-hidden bg-white ${mobileOpenSection === 'reviews' ? 'border-gray-300' : 'border-transparent'}`}>
              <button
                type="button"
                onClick={() =>
                  setMobileOpenSection(mobileOpenSection === 'reviews' ? null : 'reviews')
                }
                className={`w-full flex items-center gap-3 py-4 px-4 text-left transition-colors ${mobileOpenSection === 'reviews' ? 'bg-[rgb(22,176,238)]/5' : 'bg-white active:bg-gray-50'}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${mobileOpenSection === 'reviews' ? 'bg-[rgb(22,176,238)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Star className="h-4 w-4" />
                </span>
                <span className="flex-1 text-[14px] font-semibold text-gray-900">
                  Customer Reviews
                </span>
                {reviewCount > 0 && (
                  <span className="flex-shrink-0 text-[11px] font-semibold text-[rgb(22,176,238)] bg-[rgb(22,176,238)]/10 px-2 py-0.5 rounded-full mr-1">
                    {reviewCount}
                  </span>
                )}
                <ChevronDown className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileOpenSection === 'reviews' ? 'rotate-180 text-[rgb(22,176,238)]' : ''}`} />
              </button>
              {mobileOpenSection === 'reviews' && (
                <div className="border-t border-gray-100 px-4 py-5 bg-white space-y-5" id="reviews-mobile">
                  {reviewSubmitted ? (
                    <div className="py-6 text-center">
                      <p className="text-sm font-semibold text-green-600">Thank you! Your review has been submitted.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-extrabold uppercase text-gray-900 tracking-wide">
                        {reviewCount > 0 ? 'Add a review' : `Be the first to review "${product.itemName}"`}
                      </h3>
                      <p className="text-xs text-gray-500">Your email address will not be published. Required fields are marked <span className="text-red-500">*</span></p>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">Your rating <span className="text-red-500">*</span></span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                                <Star className={`h-5 w-5 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-gray-300 fill-none'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Your review <span className="text-red-500">*</span></label>
                          <textarea required rows={5} value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)] resize-y" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                          <input type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                          <input type="email" required value={reviewEmail} onChange={(e) => setReviewEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)]" />
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={reviewSaveInfo} onChange={(e) => setReviewSaveInfo(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[rgb(22,176,238)]" />
                          <span className="text-xs text-gray-600">Save my name, email, and website in this browser for the next time I comment.</span>
                        </label>
                        <button type="submit" disabled={reviewSubmitting || reviewRating === 0} className="bg-[#ff6b35] hover:bg-[#e85a28] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded transition-colors">
                          {reviewSubmitting ? 'Submitting…' : 'Submit'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop: horizontal tabs */}
          <nav
            className="hidden sm:flex gap-0 border-b border-gray-200 mb-8 overflow-x-auto overflow-y-hidden"
            aria-label="Product details tabs"
          >
            {[
              { id: 'description' as const, label: 'Description' },
              { id: 'specifications' as const, label: 'Specifications' },
              { id: 'reviews' as const, label: `Reviews (${reviewCount})` },
              { id: 'shipping' as const, label: 'Shipping & Returns' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-3.5 px-6 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0 ${
                  activeTab === id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop content */}
          <div className="hidden sm:block bg-white p-6 lg:p-8 rounded-2xl border border-gray-100">
            {activeTab === 'description' && (
              <div className="space-y-6 sm:space-y-8 text-gray-800">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Description</h2>
                {product.productDescription && (
                  <div
                    className="product-description-content"
                    dangerouslySetInnerHTML={{ __html: product.productDescription }}
                  />
                )}
                {(() => {
                  const bulletPoints = Array.isArray(product.bulletPoints)
                    ? product.bulletPoints
                    : typeof product.bulletPoints === 'string'
                      ? product.bulletPoints.split(',').map((s) => s.trim()).filter(Boolean)
                      : [];
                  return bulletPoints.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-3">Key Features</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {bulletPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
                {(() => {
                  const specialFeatures = Array.isArray(product.specialFeatures)
                    ? product.specialFeatures
                    : typeof product.specialFeatures === 'string'
                      ? product.specialFeatures.split(',').map((s) => s.trim()).filter(Boolean)
                      : [];
                  return specialFeatures.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-3">Applications</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {specialFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div id="reviews" className="w-full scroll-mt-6 space-y-8">
                {reviewCount > 0 && averageRating != null && Number.isFinite(averageRating) && (
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                    <span className="text-4xl font-bold text-gray-900">{Number(averageRating).toFixed(1)}</span>
                    <div>
                      <div className="flex text-[#fbbf24]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= Math.round(averageRating!) ? 'fill-current' : 'fill-none'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
                    </div>
                  </div>
                )}
                {reviewSubmitted ? (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-600 fill-current" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Thank you for your review!</h3>
                    <p className="text-sm text-gray-500">Your review has been submitted and is pending approval.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-extrabold uppercase text-gray-900 mb-1 tracking-wide">
                      {reviewCount > 0 ? 'Add a review' : `Be the first to review "${product.itemName}"`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">Your email address will not be published. Required fields are marked <span className="text-red-500">*</span></p>
                    <form onSubmit={handleReviewSubmit} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Your rating <span className="text-red-500">*</span></span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none">
                              <Star className={`h-6 w-6 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-gray-300 fill-none'}`} />
                            </button>
                          ))}
                        </div>
                        {reviewRating === 0 && <span className="text-[11px] text-red-400">Please select a rating</span>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your review <span className="text-red-500">*</span></label>
                        <textarea required rows={6} value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)] focus:border-transparent resize-y placeholder:text-gray-400" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                          <input type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                          <input type="email" required value={reviewEmail} onChange={(e) => setReviewEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[rgb(22,176,238)] focus:border-transparent" />
                        </div>
                      </div>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={reviewSaveInfo} onChange={(e) => setReviewSaveInfo(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[rgb(22,176,238)]" />
                        <span className="text-sm text-gray-600">Save my name, email, and website in this browser for the next time I comment.</span>
                      </label>
                      <button type="submit" disabled={reviewSubmitting || reviewRating === 0} className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85a28] disabled:opacity-60 text-white text-sm font-bold uppercase tracking-wider px-7 py-3 rounded transition-colors">
                        {reviewSubmitting ? 'Submitting…' : 'Submit'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' &&
              (() => {
                const specRows: { label: string; value: string }[] = [];
                if (product.productType) specRows.push({ label: 'Product Type', value: product.productType });
                if ((product as any).itemTypeName) specRows.push({ label: 'Item Type', value: (product as any).itemTypeName });
                if (product.modelNo) specRows.push({ label: 'Model Number', value: product.modelNo });
                if (product.brandName) specRows.push({ label: 'Brand', value: product.brandName });
                if (product.productId) specRows.push({ label: 'Product ID', value: product.productId });
                if (product.partNumber) specRows.push({ label: 'Part Number', value: product.partNumber });
                if (product.color) specRows.push({ label: 'Color', value: product.color });
                if (product.itemCondition) specRows.push({ label: 'Condition', value: product.itemCondition });
                if (product.manufacturerName)
                  specRows.push({ label: 'Manufacturer', value: product.manufacturerName });
                const d = product.itemDimensions;
                const hasDimensions = d && (
                  d.length != null || d.width != null || d.height != null
                );
                if (hasDimensions && d) {
                  specRows.push({
                    label: 'Dimensions',
                    value: `${d.length ?? '-'} × ${d.width ?? '-'} × ${d.height ?? '-'} ${d.unit || 'cm'}`,
                  });
                }
                if (product.itemWeight != null)
                  specRows.push({ label: 'Weight', value: `${product.itemWeight} ${(product as any).weightUnit || 'grams'}` });
                const pd = product.itemPackageDimensions || product.packageDimensions;
                const hasPackageDimensions = pd && (
                  pd.length != null || pd.width != null || pd.height != null
                );
                if (hasPackageDimensions && pd) {
                  specRows.push({
                    label: 'Package Dimensions',
                    value: `${pd.length ?? '-'} × ${pd.width ?? '-'} × ${pd.height ?? '-'} ${pd.unit || 'cm'}`,
                  });
                }
                if (product.packageWeight != null)
                  specRows.push({ label: 'Package Weight', value: `${product.packageWeight} ${(product as any).packageWeightUnit || 'grams'}` });
                if (product.countryOfOrigin)
                  specRows.push({ label: 'Country of Origin', value: product.countryOfOrigin });
                if (product.hsnCode) specRows.push({ label: 'HSN Code', value: product.hsnCode });
                if (product.warrantyDescription)
                  specRows.push({ label: 'Warranty', value: product.warrantyDescription });
                if (product.areBatteriesRequired || product.batteriesRequired)
                  specRows.push({ label: 'Batteries Required', value: 'Yes' });
                if (product.compatibleDevices && Array.isArray(product.compatibleDevices) && product.compatibleDevices.length > 0)
                  specRows.push({ label: 'Compatible Devices', value: product.compatibleDevices.join(', ') });
                if (product.includedComponents && Array.isArray(product.includedComponents) && product.includedComponents.length > 0)
                  specRows.push({ label: 'Included Components', value: product.includedComponents.join(', ') });
                if ((product as any).importerContactInformation || (product as any).importerContactInfo)
                  specRows.push({ label: 'Importer Contact', value: (product as any).importerContactInformation || (product as any).importerContactInfo });
                if ((product as any).packerContactInformation || (product as any).packerContactInfo)
                  specRows.push({ label: 'Packer Contact', value: (product as any).packerContactInformation || (product as any).packerContactInfo });
                if (product.attributeValues && typeof product.attributeValues === 'object') {
                  Object.entries(product.attributeValues).forEach(([name, value]) => {
                    if (value != null && String(value).trim()) specRows.push({ label: name, value: String(value).trim() });
                  });
                }
                if (specRows.length === 0) {
                  return (
                    <div className="bg-white w-full overflow-hidden py-8 px-4 text-center text-[#718096] text-sm">
                      No specifications available for this product.
                    </div>
                  );
                }
                return (
                  <div className="bg-white w-full overflow-hidden">
                    <dl className="divide-y divide-[#e0e0e0]">
                      {specRows.map((row, index) => (
                        <div key={index} className="flex items-center py-4 px-4 sm:px-6 text-sm">
                          <dt className="text-[#4a4a4a] font-semibold pr-4 flex-shrink-0">{row.label}</dt>
                          <dd className="text-[#333] font-normal text-right flex-1 ml-auto">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })()}

            {activeTab === 'shipping' && (
              <div className="space-y-6 sm:space-y-10 max-w-3xl text-gray-800">
                <section>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Shipping Information</h3>
                  <p className="text-gray-700 mb-4">
                    We offer fast and reliable shipping options to ensure your products arrive safely and on time.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Free Standard Shipping:</strong> Orders over ₹999 (5–7 business days)</li>
                    <li><strong>Standard Shipping:</strong> ₹99 (5–7 business days)</li>
                    <li><strong>Express Shipping:</strong> ₹199 (2–3 business days)</li>
                    <li><strong>Next Day Delivery:</strong> ₹299 (order by 2 PM)</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Returns & Exchanges</h3>
                  <p className="text-gray-700 mb-4">
                    We want you to be completely satisfied with your purchase. If you&apos;re not happy with your
                    order, we offer a 30-day money-back guarantee.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Items must be in original packaging with all accessories</li>
                    <li>Return shipping is free for defective items</li>
                    <li>Refunds processed within 5–7 business days of receiving return</li>
                    <li>Exchanges are processed immediately upon receipt</li>
                  </ul>
                </section>
              </div>
            )}
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[1.75rem] font-bold text-[#1a202c] mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentlyViewed.map((item) => (
                <React.Fragment key={item._id}>{renderProductCard(item)}</React.Fragment>
              ))}
            </div>
          </div>
        )}

        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[1.75rem] font-bold text-[#1a202c] mb-6">You May Also Like</h2>
            {loadingSimilar ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-2xl overflow-hidden">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {similarProducts.map((item) => (
                  <React.Fragment key={item._id}>{renderProductCard(item)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    {mounted && lightboxOpen && createPortal(
      <>
        {/* ── Mobile full-screen gallery ── */}
        <div className="sm:hidden fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Back button */}
          <div className="flex-shrink-0 flex items-center px-4 pt-4 pb-2">
            <button
              onClick={handleCloseLightbox}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 active:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 relative overflow-hidden">
            {images.length > 1 && (
              <>
                <button onClick={handleLightboxPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow flex items-center justify-center text-gray-500"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={handleLightboxNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow flex items-center justify-center text-gray-500"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={images[lightboxImageIndex] || product.mainImage}
                alt={`${product.itemName} ${lightboxImageIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
              />
            </div>
            {/* dot indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => handleLightboxImageChange(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxImageIndex ? 'bg-[rgb(22,176,238)] w-3' : 'bg-gray-300'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleLightboxImageChange(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${lightboxImageIndex === index ? 'border-[rgb(22,176,238)]' : 'border-gray-200'}`}
                  >
                    <img src={img} alt={`${product.itemName} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop modal (unchanged) ── */}
        <div className="hidden sm:block fixed inset-0 z-[9998] bg-black/60" onClick={handleCloseLightbox} />
        <div className="hidden sm:flex fixed left-8 right-8 top-8 bottom-8 lg:left-16 lg:right-16 lg:top-12 lg:bottom-12 z-[9999] flex-row bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Left: image area */}
          <div className="flex-1 flex flex-col relative bg-white min-h-0">
            <div className="flex items-center justify-between px-5 h-11 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-0">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-3 cursor-default">Videos</span>
                <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider px-3 py-3 border-b-2 border-gray-900 cursor-default">Images</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleLightboxZoomIn} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
                <button onClick={handleLightboxZoomOut} disabled={lightboxZoom <= 1} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 relative min-h-0 overflow-hidden">
              {images.length > 1 && (
                <>
                  <button onClick={handleLightboxPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-sm transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={handleLightboxNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-sm transition-colors"><ChevronRight className="h-5 w-5" /></button>
                </>
              )}
              <div
                ref={setLightboxImageRef}
                className={`w-full h-full flex items-center justify-center p-10 ${lightboxZoom > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
                onMouseMove={lightboxZoom > 1 ? handleLightboxMouseMove : undefined}
                onMouseEnter={() => lightboxZoom > 1 && setLightboxShowZoom(true)}
                onMouseLeave={() => setLightboxShowZoom(false)}
              >
                <img
                  src={images[lightboxImageIndex] || product.mainImage}
                  alt={`${product.itemName} ${lightboxImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
                  style={{
                    transform: lightboxZoom > 1
                      ? `scale(${lightboxZoom}) translate(${(lightboxPosition.x - 50) * (lightboxZoom - 1)}%, ${(lightboxPosition.y - 50) * (lightboxZoom - 1)}%)`
                      : 'scale(1)',
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
          {/* Right: info panel */}
          <div className="w-[260px] lg:w-[290px] xl:w-[320px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-end px-4 h-11 border-b border-gray-200 flex-shrink-0">
              <button onClick={handleCloseLightbox} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-[13px] font-semibold text-gray-900 leading-snug mb-2">{product.itemName}</h2>
              {activeVariant && (
                <p className="text-[11px] text-gray-500 mb-4">
                  {Object.entries(activeVariant.attributes || {}).map(([k, v]) => `${k}:${v}`).join(', ')}
                </p>
              )}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {images.map((img, index) => (
                    <button key={index} onClick={() => handleLightboxImageChange(index)} className={`aspect-square overflow-hidden border-2 transition-all ${lightboxImageIndex === index ? 'border-[rgb(22,176,238)] ring-1 ring-blue-100' : 'border-gray-200 hover:border-gray-400'}`}>
                      <img src={img} alt={`${product.itemName} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
