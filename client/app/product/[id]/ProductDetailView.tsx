'use client';

import React from 'react';
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
} from 'lucide-react';
import type { Product } from './types';

/** Amazon-style zoom: fixed lens size, zoom panel uses background-image (no img scale) */
const LENS_SIZE = 250;
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
  } = props;

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
            <div className="flex flex-col gap-3">
            {/* Main image - full width of left column */}
            <div className="relative w-full">
              <div
                ref={setImageRef}
                className="aspect-square w-full rounded-lg overflow-hidden relative cursor-zoom-in flex items-center justify-center bg-gray-50 border border-gray-100"
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
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#ff6b35] transition-colors"
                aria-label="Full screen"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
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
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1">
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
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[#1a202c] leading-tight break-words">
              {product.itemName}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-[#fbbf24] text-base sm:text-lg tracking-wider" aria-hidden>★★★★★</div>
                <div className="text-[#4a5568] text-xs sm:text-[0.9rem]">4.8 (256 reviews)</div>
              </div>
              <div className="text-[#4a5568] text-xs sm:text-[0.9rem]">
                <Link href="#reviews" className="text-[#4299e1] hover:underline">Write a review</Link>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#f7fafc] rounded-lg border-l-4 border-[#ff6b35]">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold text-[#ff6b35]">
                  {formatPrice(product.yourPrice)}
                </span>
                {(product.maximumRetailPrice || product.maxRetailPrice) &&
                  (product.maximumRetailPrice || product.maxRetailPrice)! > product.yourPrice && (
                  <>
                    <span className="text-[1.2rem] text-[#a0aec0] line-through ml-1">
                      {formatPrice((product.maximumRetailPrice || product.maxRetailPrice)!)}
                    </span>
                    {discount > 0 && (
                      <span className="ml-4 px-3 py-1 bg-[#fef5e7] text-[#d69e2e] rounded text-[0.9rem] font-semibold">
                        Save {discount}%
                      </span>
                    )}
                  </>
                )}
                {(product as any).salePrice && (product as any).salePrice > 0 && (product as any).salePrice !== product.yourPrice && (
                  <div className="mt-2 text-sm text-[#48bb78] font-semibold">
                    Sale Price: {formatPrice((product as any).salePrice)}
                  </div>
                )}
                {(product as any).saleStartDate && (product as any).saleEndDate && (
                  <div className="mt-2 text-xs text-[#718096]">
                    Sale Period: {new Date((product as any).saleStartDate).toLocaleDateString()} - {new Date((product as any).saleEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              {product.stockQuantity !== undefined && (
                <div
                  className={`mt-3 flex items-center gap-2 font-semibold ${
                    product.stockQuantity > 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'
                  }`}
                >
                  <Check className={`h-4 w-4 flex-shrink-0 ${product.stockQuantity > 0 ? '' : 'hidden'}`} />
                  {product.stockQuantity > 0 ? (
                    <>In Stock - {product.stockQuantity} units available</>
                  ) : (
                    <>Out of Stock</>
                  )}
                </div>
              )}
            </div>

            {(product as any).shortDescription && (
              <p className="text-[#4a5568] text-[1.05rem] leading-[1.7] font-medium">
                {(product as any).shortDescription}
              </p>
            )}
            {plainDescription && (
              <p className="text-[#4a5568] text-[1.05rem] leading-[1.7] line-clamp-4">{plainDescription}</p>
            )}

            <div className="pb-4 border-b border-[#e2e8f0]">
              <form onSubmit={handlePincodeCheck} className="space-y-3">
                <label className="block font-semibold text-sm sm:text-base text-[#2d3748] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff6b35] flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Check Delivery & Serviceability</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => onPincodeChange(e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-lg bg-[#f7fafc] text-sm focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35]"
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#ff6b35] text-white text-sm font-semibold rounded-lg hover:bg-[#e85a28] transition-colors whitespace-nowrap"
                  >
                    Check
                  </button>
                </div>
                {pincodeCheckResult && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                      pincodeCheckResult.available ? 'bg-[#c6f6d5] text-[#22543d]' : 'bg-[#fed7d7] text-[#742a2a]'
                    }`}
                  >
                    {pincodeCheckResult.available ? '✓' : '✗'} {pincodeCheckResult.message}
                  </div>
                )}
              </form>
            </div>

            {/* Row 1: Quantity (left) + Add to Cart + Wishlist + Share */}
            <div className="pb-4 border-b border-[#e2e8f0] flex flex-wrap items-end gap-3 sm:gap-4">
              <div>
                <div className="font-semibold text-[#2d3748] mb-2">Quantity</div>
                <div className="flex border border-[#e2e8f0] rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 bg-[#f7fafc] text-[#4a5568] text-lg hover:bg-[#edf2f7] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-[60px] text-center py-2 border-x border-[#e2e8f0] text-base font-semibold bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 bg-[#f7fafc] text-[#4a5568] text-lg hover:bg-[#edf2f7]"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`flex-1 min-w-[140px] py-3 sm:py-4 px-4 sm:px-8 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                  addedToCart
                    ? 'bg-[#48bb78] text-white'
                    : product.stockQuantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#ff6b35] text-white hover:bg-[#e85a28] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
                }`}
              >
                {addedToCart ? (
                  <><Check className="h-5 w-5" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(String(product._id));
                }}
                className="p-3 sm:p-4 rounded-lg border border-[#e2e8f0] bg-[#f7fafc] text-[#4a5568] hover:bg-[#edf2f7] transition-colors shrink-0"
                title="Wishlist"
                aria-label={isInWishlist(String(product._id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist(String(product._id)) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-3 sm:p-4 rounded-lg border border-[#e2e8f0] bg-[#f7fafc] text-[#4a5568] hover:bg-[#edf2f7] transition-colors shrink-0"
                title="Share"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>

            {/* Row 2: Buy Now + Buy from Amazon (side by side) */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className={`py-3 sm:py-4 px-4 sm:px-8 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border-2 border-[#ff6b35] text-[#ff6b35] bg-white hover:bg-[#fff5f2] transition-colors ${
                  product.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" /> <span className="hidden sm:inline">Buy Now</span>
                <span className="sm:hidden">Buy</span>
              </button>
              {product.amazonLink && product.amazonLink.trim() && (
                <a
                  href={product.amazonLink.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-8 rounded-lg font-semibold text-sm sm:text-base bg-[#ff9900] text-black hover:bg-[#e88b00] transition-colors border border-[#cc7a00]"
                >
                  <ExternalLink className="h-5 w-5" />
                  Buy from Amazon
                </a>
              )}
            </div>

            {/* Benefits: after Buy Now / Buy from Amazon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#f7fafc] rounded-lg">
              <div className="flex items-center gap-3 text-[0.9rem] text-[#2d3748]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>Free shipping on orders over ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem] text-[#2d3748]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem] text-[#2d3748]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>2-year manufacturer warranty</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem] text-[#2d3748]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <nav
            className="flex gap-2 border-b-2 border-[#e2e8f0] mb-6 sm:mb-8 overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0"
            aria-label="Product details tabs"
          >
            {[
              { id: 'description' as const, label: 'Product Description' },
              { id: 'specifications' as const, label: 'Specifications' },
              { id: 'reviews' as const, label: 'Reviews (256)' },
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

          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
            {activeTab === 'description' && (
              <div className="space-y-6 sm:space-y-8 text-gray-800">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Description</h2>
                {product.productDescription && (
                  <div
                    className="prose max-w-none prose-img:max-w-full prose-img:h-auto"
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
              <div className="space-y-6 sm:space-y-8 w-full">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 sm:pb-8 border-b-2 border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-4 mb-3">
                      <span className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#4299e1] bg-clip-text text-transparent">
                        4.8
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 sm:h-6 sm:w-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Based on 120 customer reviews</p>
                  </div>
                  <button
                    type="button"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#ff6b35] to-[#4299e1] text-white text-xs sm:text-sm font-bold hover:from-[#e85a28] hover:to-[#3182ce] transition-all rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Write a Review
                  </button>
                </div>
                <div className="space-y-3 mb-8 bg-white p-6 rounded-xl border border-gray-200">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-700 w-20">{rating} star</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                          style={{ width: `${[53, 34, 10, 2, 1][5 - rating]}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-12 text-right">
                        {[53, 34, 10, 2, 1][5 - rating]}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-200 bg-white p-6 rounded-xl hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#4299e1] flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">John D.</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                          Verified Purchase
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">4 days ago</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Great product! Excellent quality and fast delivery. Highly recommend.
                      </p>
                    </div>
                  </div>
                </div>
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
                  specRows.push({ label: 'Weight', value: `${product.itemWeight} kg` });
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
                  specRows.push({ label: 'Package Weight', value: `${product.packageWeight} kg` });
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
