'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  } = props;

  const touchStartX = useRef(0);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const [thumbScroll, setThumbScroll] = useState({ canScrollLeft: false, canScrollRight: false });

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
      className="min-h-screen text-[#2d3748] overflow-x-hidden"
      style={{ backgroundColor: 'rgb(239 239 239 / 33%)' }}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 mb-6 w-full min-w-0">
        <nav className="flex items-center gap-2 text-[0.9rem] text-[#718096] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="text-[#4299e1] hover:underline">Home</Link>
          <span>/</span>
          <Link href="/shop" className="text-[#4299e1] hover:underline">Products</Link>
          {product?.productCategory && (
            <>
              <span>/</span>
              <Link
                href={`/product-category/${product.productCategory.slug || product.productCategory._id}`}
                className="text-[#4299e1] hover:underline"
              >
                {product.productCategory.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate max-w-[200px]">{product.itemName}</span>
        </nav>

        {/* Layout: left = full-width main image + thumbnails; right = product info. Zoom panel overlaps right on hover. */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 bg-white p-3 sm:p-6 lg:p-8 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] mb-6 min-w-0 relative">
          <div className="min-w-0 relative">
            {/* Mobile: image carousel with dots + wishlist/share below image */}
            <div className="lg:hidden flex flex-col gap-3">
              <div
                className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-100 touch-pan-y"
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
              <div className="flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(String(product._id));
                  }}
                  className="p-3 rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label={isInWishlist(String(product._id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(String(product._id)) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-full border border-gray-200 bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
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
            {/* Zoom panel - appears on hover, positioned to the right and overlapping product info */}
            <div
              className={`hidden lg:block absolute left-full top-0 ml-4 z-30 w-[800px] h-[800px] transition-opacity duration-150 pointer-events-none ${showZoom ? 'opacity-100' : 'opacity-0'}`}
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

          {lightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
              <div className="relative w-full max-w-[95vw] h-[90vh] sm:h-[75vh] flex flex-col sm:flex-row bg-white shadow-2xl overflow-hidden">
                <div className="flex-1 flex items-center justify-center relative bg-gray-50 min-h-[50vh] sm:min-h-0">
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handleLightboxPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-gray-700 hover:text-white p-3 bg-white bg-opacity-90 hover:bg-gray-900 transition-all shadow-lg"
                        aria-label="Previous Image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleLightboxNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-gray-700 hover:text-white p-3 bg-white bg-opacity-90 hover:bg-gray-900 transition-all shadow-lg"
                        aria-label="Next Image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  <div
                    ref={setLightboxImageRef}
                    className={`relative w-full h-full flex items-center justify-center overflow-hidden p-8 ${
                      lightboxZoom > 1 ? 'cursor-move' : 'cursor-zoom-in'
                    }`}
                    onMouseMove={lightboxZoom > 1 ? handleLightboxMouseMove : undefined}
                    onMouseEnter={() => lightboxZoom > 1 && setLightboxShowZoom(true)}
                    onMouseLeave={() => setLightboxShowZoom(false)}
                  >
                    <img
                      src={images[lightboxImageIndex] || product.mainImage}
                      alt={`${product.itemName} ${lightboxImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{
                        transform: lightboxZoom > 1
                          ? `scale(${lightboxZoom}) translate(${(lightboxPosition.x - 50) * (lightboxZoom - 1)}%, ${(lightboxPosition.y - 50) * (lightboxZoom - 1)}%)`
                          : 'scale(1)',
                      }}
                      draggable={false}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[400px] bg-white border-t sm:border-t-0 sm:border-l border-gray-200 flex flex-col max-h-[40vh] sm:max-h-none">
                  <div className="flex items-start justify-end p-4 border-b border-gray-200">
                    <button
                      onClick={handleCloseLightbox}
                      className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            onClick={handleLightboxZoomIn}
                            className="w-8 h-8 border-2 border-teal-500 flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors"
                            aria-label="Zoom In"
                            title="Zoom In"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleLightboxZoomOut}
                            className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={lightboxZoom <= 1}
                            aria-label="Zoom Out"
                            title="Zoom Out"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-base font-normal text-gray-900 leading-relaxed">
                            {product.itemName}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => handleLightboxImageChange(index)}
                            className={`aspect-square overflow-hidden border-2 transition-all ${
                              lightboxImageIndex === index
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
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
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 min-w-0">
            {/* Category above title */}
            {product.productCategory && (
              <div className="text-xs sm:text-sm text-[#6b7280]">
                <span className="mr-1">Category</span>
                <Link
                  href={`/product-category/${product.productCategory.slug || product.productCategory._id}`}
                  className="font-medium text-[#1d4ed8] hover:underline"
                >
                  {product.productCategory.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-[#111111] leading-tight break-words tracking-tight">
              {product.itemName}
            </h1>

            {/* Rating / reviews */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#4b5563]">
              {reviewCount > 0 && averageRating != null && Number.isFinite(averageRating) ? (
                <>
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
                </>
              ) : (
                <Link href="#reviews" className="text-[#4299e1] hover:underline font-medium">Be the first to review</Link>
              )}
            </div>

            {/* Variant selectors */}
            {variantAttributesMap && Object.keys(variantAttributesMap).length > 0 && (
              <div className="space-y-3 pt-1">
                {Object.entries(variantAttributesMap).map(([name, values]) => (
                  <div key={name} className="space-y-1">
                    <div className="text-xs font-medium text-gray-600">
                      {name}
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                            className={`px-3 py-1.5 border text-xs sm:text-sm ${
                              isSelected
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 text-gray-800 hover:border-black'
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
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl lg:text-[2.25rem] font-semibold text-[#111111]">
                  {formatPrice(effectivePrice ?? product.yourPrice)}
                </span>
                {(() => {
                  const baseMrp = product.maximumRetailPrice || product.maxRetailPrice;
                  const mrpToUse =
                    typeof effectiveMrp === 'number' ? effectiveMrp : baseMrp;
                  const priceToUse = effectivePrice ?? product.yourPrice;
                  if (!mrpToUse || mrpToUse <= priceToUse) return null;
                  return (
                  <>
                    <span className="text-base sm:text-lg text-[#9ca3af] line-through">
                      {formatPrice(mrpToUse)}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs sm:text-sm font-semibold text-[#16a34a]">
                        Save {discount}%
                      </span>
                    )}
                  </>
                  );
                })()}
              </div>
              {(effectiveStock ?? product.stockQuantity) !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                      (effectiveStock ?? product.stockQuantity)! > 0
                        ? 'border-[#16a34a] bg-[#dcfce7]'
                        : 'border-[#f97316] bg-[#ffedd5]'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        (effectiveStock ?? product.stockQuantity)! > 0 ? 'bg-[#16a34a]' : 'bg-[#f97316]'
                      }`}
                    />
                  </span>
                  <span
                    className={`font-medium ${
                      (effectiveStock ?? product.stockQuantity)! > 0 ? 'text-[#166534]' : 'text-[#9a3412]'
                    }`}
                  >
                    {(effectiveStock ?? product.stockQuantity)! > 0
                      ? `Available in stock (${effectiveStock ?? product.stockQuantity})`
                      : 'Out of stock'}
                  </span>
                </div>
              )}
            </div>

            {(product as any).shortDescription && (
              <p className="text-[#4b5563] text-[0.95rem] sm:text-base leading-relaxed max-w-2xl">
                {(product as any).shortDescription}
              </p>
            )}

            {/* Pincode + primary CTAs card */}
            <div className="mt-4 space-y-4 p-4 sm:p-5">
              <form onSubmit={handlePincodeCheck} className="space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2d3748]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff6b35]" />
                    <span>Enter pincode for delivery estimate</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a0aec0]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => onPincodeChange(e.target.value)}
                      placeholder="Enter pincode for delivery estimate"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white text-sm border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35]"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#ff6b35] text-white text-sm sm:text-base font-semibold shadow-sm hover:bg-[#e85a28] transition-colors whitespace-nowrap"
                  >
                    Check
                  </button>
                </div>
                {pincodeCheckResult && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs sm:text-sm font-medium ${
                      pincodeCheckResult.available ? 'bg-[#c6f6d5] text-[#22543d]' : 'bg-[#fed7d7] text-[#742a2a]'
                    }`}
                  >
                    {pincodeCheckResult.available ? '✓' : '✗'} {pincodeCheckResult.message}
                  </div>
                )}
              </form>

              {/* Main CTA buttons: Add to Cart / Buy Now / Amazon */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className={`w-full sm:flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all ${
                    addedToCart
                      ? 'bg-[#22c55e] text-white'
                      : product.stockQuantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#ff6b35] text-white hover:bg-[#e85a28] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(255,107,53,0.45)]'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stockQuantity === 0}
                  className={`w-full sm:w-auto py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all ${
                    product.stockQuantity === 0
                      ? 'bg-gray-800 text-white/70 cursor-not-allowed opacity-60'
                      : 'bg-[#111827] text-white hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.45)]'
                  }`}
                >
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Buy Now</span>
                </button>

                {product.amazonLink && product.amazonLink.trim() && (
                  <a
                    href={product.amazonLink.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base bg-[#ff9900] text-black hover:bg-[#e88b00] transition-all border border-[#cc7a00] flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(250,204,21,0.5)]"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Amazon
                  </a>
                )}
              </div>

              {/* Secondary row: quantity */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <div>
                  <div className="font-semibold text-[0.75rem] sm:text-xs text-[#4b5563] mb-1.5">Quantity</div>
                  <div className="flex border border-[#e2e8f0] rounded-md overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-[#4a5568] text-base hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-[52px] text-center py-2 border-x border-[#e2e8f0] text-sm font-semibold bg-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-[#4a5568] text-base hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits: reassurance icons row */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-[#111827]">Free Shipping</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">On orders over ₹999</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-[#111827]">30 Day Returns</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Money back guarantee</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-[#111827]">2 Year Warranty</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Manufacturer warranty</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecfdf3] text-[#16a34a]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold text-[#111827]">Secure Checkout</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Safe & encrypted payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          {/* Mobile: accordion-style sections with simple bottom borders (no cards) */}
          <div className="sm:hidden mb-4 border-t border-[#e2e8f0]">
            {/* Description */}
            <div className="border-b border-[#e2e8f0] bg-white">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'description' ? 'description' : 'description')}
                className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-left"
              >
                <span className={activeTab === 'description' ? 'text-[#111827]' : 'text-[#6b7280]'}>
                  Product Description
                </span>
                {activeTab === 'description' ? (
                  <Minus className="h-4 w-4 text-[#111827]" />
                ) : (
                  <Plus className="h-4 w-4 text-[#6b7280]" />
                )}
              </button>
              {activeTab === 'description' && (
                <div className="border-t border-[#e2e8f0] px-4 py-4 space-y-4 text-sm text-gray-800">
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
            <div className="border-b border-[#e2e8f0] bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('specifications')}
                className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-left"
              >
                <span className={activeTab === 'specifications' ? 'text-[#111827]' : 'text-[#6b7280]'}>
                  Specifications
                </span>
                {activeTab === 'specifications' ? (
                  <Minus className="h-4 w-4 text-[#111827]" />
                ) : (
                  <Plus className="h-4 w-4 text-[#6b7280]" />
                )}
              </button>
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
                      <div className="border-t border-[#e2e8f0] px-4 py-4 text-center text-[#718096] text-sm">
                        No specifications available for this product.
                      </div>
                    );
                  }
                  return (
                    <div className="border-t border-[#e2e8f0] px-4 py-4">
                      <dl className="divide-y divide-[#e0e0e0]">
                        {specRows.map((row, index) => (
                          <div key={index} className="flex items-center py-3 text-sm">
                            <dt className="text-[#4a4a4a] font-semibold pr-4 flex-shrink-0">{row.label}</dt>
                            <dd className="text-[#333] font-normal text-right flex-1 ml-auto">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })()}
            </div>

            {/* Shipping & Returns */}
            <div className="border-b border-[#e2e8f0] bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-left"
              >
                <span className={activeTab === 'shipping' ? 'text-[#111827]' : 'text-[#6b7280]'}>
                  Shipping & Returns
                </span>
                {activeTab === 'shipping' ? (
                  <Minus className="h-4 w-4 text-[#111827]" />
                ) : (
                  <Plus className="h-4 w-4 text-[#6b7280]" />
                )}
              </button>
              {activeTab === 'shipping' && (
                <div className="border-t border-[#e2e8f0] px-4 py-4 space-y-4 text-sm text-gray-800">
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
            <div className="border-b border-[#e2e8f0] bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-left"
              >
                <span className={activeTab === 'reviews' ? 'text-[#111827]' : 'text-[#6b7280]'}>
                  Reviews ({reviewCount})
                </span>
                {activeTab === 'reviews' ? (
                  <Minus className="h-4 w-4 text-[#111827]" />
                ) : (
                  <Plus className="h-4 w-4 text-[#6b7280]" />
                )}
              </button>
              {activeTab === 'reviews' && (
                <div className="border-t border-[#e2e8f0] px-4 py-4 space-y-4 text-sm text-gray-800" id="reviews">
                  {reviewCount > 0 && averageRating != null && Number.isFinite(averageRating) ? (
                    <div className="flex flex-col gap-4 pb-4 border-b border-gray-200 bg-[#fafafa] p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-[#1a202c]">
                          {Number(averageRating).toFixed(1)}
                        </span>
                        <div className="flex text-[#fbbf24]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'fill-none'}`} />
                          ))}
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                      <button type="button" className="px-5 py-2.5 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e85a28] transition-colors">
                        Write a review
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-[#fafafa] rounded-xl border border-gray-100 text-center">
                      <div className="flex text-[#e2e8f0] mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-8 w-8" />
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-[#1a202c] mb-1">No reviews yet</h3>
                      <p className="text-[#4a5568] text-sm max-w-md mb-4">
                        Be the first to share your experience with this product.
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-6 py-3 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e85a28] transition-colors"
                      >
                        Write a review
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop: horizontal tabs */}
          <nav
            className="hidden sm:flex gap-2 border-b-2 border-[#e2e8f0] mb-6 sm:mb-8 overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0"
            aria-label="Product details tabs"
          >
            {[
              { id: 'description' as const, label: 'Product Description' },
              { id: 'specifications' as const, label: 'Specifications' },
              { id: 'reviews' as const, label: `Reviews (${reviewCount})` },
              { id: 'shipping' as const, label: 'Shipping & Returns' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-6 sm:px-8 text-sm sm:text-base font-semibold whitespace-nowrap border-b-[3px] -mb-0.5 transition-colors flex-shrink-0 ${
                  activeTab === id
                    ? 'border-[#ff6b35] text-[#ff6b35]'
                    : 'border-transparent text-[#718096] hover:text-[#2d3748]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop content card */}
          <div className="hidden sm:block bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
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
              <div id="reviews" className="space-y-6 sm:space-y-8 w-full scroll-mt-6">
                {reviewCount > 0 && averageRating != null && Number.isFinite(averageRating) ? (
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 sm:pb-8 border-b-2 border-gray-200 bg-[#fafafa] p-4 sm:p-6 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-bold text-[#1a202c]">{Number(averageRating).toFixed(1)}</span>
                      <div className="flex text-[#fbbf24]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 sm:h-6 sm:w-6 ${star <= Math.round(averageRating) ? 'fill-current' : 'fill-none'}`} />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-gray-600">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e85a28] transition-colors">Write a review</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-[#fafafa] rounded-xl border border-gray-100 text-center">
                    <div className="flex text-[#e2e8f0] mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-8 w-8 sm:h-10 sm:w-10" />
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-[#1a202c] mb-2">No reviews yet</h3>
                    <p className="text-[#4a5568] text-sm sm:text-base max-w-md mb-6">Be the first to share your experience with this product.</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-6 py-3 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e85a28] transition-colors"
                    >
                      Write a review
                    </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse bg-[rgb(249,250,251)] rounded-lg overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {similarProducts.map((item) => (
                  <React.Fragment key={item._id}>{renderProductCard(item)}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
