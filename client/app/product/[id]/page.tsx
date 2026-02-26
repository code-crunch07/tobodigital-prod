'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseProductSlugId, getProductUrl } from '@/lib/product-url';
import { ShoppingCart, Heart, Check, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, MapPin, Zap, Package, Info, Truck, Shield, FileText, Ruler, Weight, Globe, Battery, Box, Star, Home, Eye, Layers, RefreshCw, Tag, ExternalLink } from 'lucide-react';
import { getProductById, getProducts, checkPincodeServiceability } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from './types';
import { ProductDetailView } from './ProductDetailView';

/** Strip HTML tags and collapse whitespace for plain-text excerpt */
function toPlainText(html: string): string {
  return html
    .replace(new RegExp('<[^>]+>', 'g'), ' ')
    .replace(new RegExp('\\s+', 'g'), ' ')
    .trim();
}

/** Amazon-style zoom: lens size and zoom panel size (no img scaling, background-image zoom) */
const LENS_SIZE = 300;
const ZOOM_PANEL_SIZE = 800;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = (params.id as string) || '';
  const productId = parseProductSlugId(rawParam);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    px: 0,
    py: 0,
    percentX: 50,
    percentY: 50,
  });
  const [showZoom, setShowZoom] = useState(false);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPosition, setLightboxPosition] = useState({ x: 0, y: 0 });
  const [lightboxShowZoom, setLightboxShowZoom] = useState(false);
  const [lightboxImageRef, setLightboxImageRef] = useState<HTMLDivElement | null>(null);
  const [pincode, setPincode] = useState('');
  const [pincodeCheckResult, setPincodeCheckResult] = useState<{ available: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specifications' | 'shipping'>('description');
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Set page title and meta tags for SEO and social sharing
  useEffect(() => {
    if (product?.itemName) {
      const siteName = 'Tobo Digital';
      const title = `${product.itemName} | ${siteName}`;
      document.title = title;

      // Get absolute image URL (product.mainImage should already be resolved by API, but ensure it's absolute)
      const getAbsoluteImageUrl = (img: string | undefined): string => {
        if (!img) return '';
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
        return `${apiOrigin}${img.startsWith('/') ? '' : '/'}${img}`;
      };
      const imageUrl = getAbsoluteImageUrl(product.mainImage);

      // Get absolute page URL
      const pageUrl = typeof window !== 'undefined' 
        ? window.location.href 
        : `${process.env.NEXT_PUBLIC_STOREFRONT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://tobodigital.com'}${getProductUrl(product)}`;

      // Description from product description or short description
      const description = product.productDescription 
        ? product.productDescription.replace(/<[^>]*>/g, '').substring(0, 160)
        : (product as any).shortDescription || `Check out ${product.itemName} on ${siteName}`;

      // Set or update meta tags for Open Graph and Twitter
      const setMetaTag = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      const setMetaName = (name: string, content: string) => {
        let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // Open Graph tags
      setMetaTag('og:title', title);
      setMetaTag('og:description', description);
      setMetaTag('og:type', 'product');
      setMetaTag('og:url', pageUrl);
      if (imageUrl) {
        setMetaTag('og:image', imageUrl);
        setMetaTag('og:image:width', '1200');
        setMetaTag('og:image:height', '630');
        setMetaTag('og:image:alt', product.itemName);
      }

      // Twitter Card tags
      setMetaName('twitter:card', 'summary_large_image');
      setMetaName('twitter:title', title);
      setMetaName('twitter:description', description);
      if (imageUrl) {
        setMetaName('twitter:image', imageUrl);
      }

      return () => {
        document.title = siteName;
        // Clean up meta tags on unmount
        document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(el => {
          if (el.getAttribute('property')?.startsWith('og:') || el.getAttribute('name')?.startsWith('twitter:')) {
            el.remove();
          }
        });
      };
    }
  }, [product]);

  // Update URL bar to show product name (slug-id) when user landed on id-only URL
  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    const prettyPath = getProductUrl(product);
    const currentPath = window.location.pathname;
    // Only replace if we're on the old ID-only URL format (exactly matches /product/{id})
    // Don't interfere with normal navigation
    if (currentPath === `/product/${product._id}` && currentPath !== prettyPath) {
      // Use replace with scroll: false to avoid navigation issues
      router.replace(prettyPath, { scroll: false });
    }
  }, [product, rawParam, router]);

  const loadProduct = async () => {
    try {
      const response = await getProductById(productId);
      const productData = response.data;
      setProduct(productData);
      setSelectedImage(productData.mainImage || '');
      
      // Add to recently viewed
      addToRecentlyViewed(productData);
      
      // Load similar products
      loadSimilarProducts(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentlyViewed = (product: Product) => {
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Remove if already exists
      const filtered = viewed.filter((p: Product) => p._id !== product._id);
      // Add to beginning
      filtered.unshift({
        _id: product._id,
        itemName: product.itemName,
        brandName: product.brandName,
        mainImage: product.mainImage,
        yourPrice: product.yourPrice,
        maximumRetailPrice: product.maximumRetailPrice || product.maxRetailPrice,
      });
      // Keep only last 10
      const limited = filtered.slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(limited));
      setRecentlyViewed(limited.slice(1, 5)); // Show 4 most recent (excluding current)
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const fallbackUrl =
      (process.env.NEXT_PUBLIC_STOREFRONT_URL || process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, '') ||
      'https://tobodigital.com';

    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `${fallbackUrl}${getProductUrl(product)}`;

    const title = product.itemName;
    const text = `Check out this product on Tobo Digital: ${product.itemName}`;

    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title, text, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard');
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          alert('Product link copied to clipboard');
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const loadSimilarProducts = async (currentProduct: Product) => {
    try {
      setLoadingSimilar(true);
      const categoryId = currentProduct.productCategory?._id;
      const subCategoryId = currentProduct.subCategory?._id || currentProduct.productSubCategory?._id;
      
      if (!categoryId) {
        setLoadingSimilar(false);
        return;
      }

      const params: any = {
        limit: 8,
        category: categoryId,
      };
      
      if (subCategoryId) {
        params.subcategory = subCategoryId;
      }

      const response = await getProducts(params);
      const products = response.data?.products || [];
      // Filter out current product
      const filtered = products.filter((p: Product) => p._id !== currentProduct._id);
      setSimilarProducts(filtered.slice(0, 6));
    } catch (error) {
      console.error('Error loading similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    // Load recently viewed on mount
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Filter out current product
      const filtered = viewed.filter((p: Product) => p._id !== productId);
      setRecentlyViewed(filtered.slice(0, 4));
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // ProductCard component matching homepage design
  const ProductCard = ({ product }: { product: Product }) => {
    // Calculate discount
    let discount = 0;
    const maxRetailPrice = product.maximumRetailPrice || product.maxRetailPrice;
    const salePrice = product.salePrice;
    
    const now = new Date();
    const saleStartDate = product.saleStartDate ? new Date(product.saleStartDate) : null;
    const saleEndDate = product.saleEndDate ? new Date(product.saleEndDate) : null;
    const isSaleActive = salePrice && 
      (!saleStartDate || saleStartDate <= now) && 
      (!saleEndDate || saleEndDate >= now);
    
    const currentPrice = isSaleActive && salePrice < product.yourPrice ? salePrice : product.yourPrice;
    
    if (maxRetailPrice && maxRetailPrice > currentPrice) {
      discount = Math.round(((maxRetailPrice - currentPrice) / maxRetailPrice) * 100);
    } else if (isSaleActive && salePrice < product.yourPrice && maxRetailPrice) {
      discount = Math.round(((maxRetailPrice - salePrice) / maxRetailPrice) * 100);
    }
    
    const isAdded = addedItems.has(product._id);
    const isWishlisted = isInWishlist(product._id);

    const handleAddToCart = (e: React.MouseEvent) => {
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

    const handleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product._id);
    };

    const hoverImage = (product.galleryImages?.length && product.galleryImages[0]) ? product.galleryImages[0] : product.mainImage;
    const hasHoverImage = product.galleryImages?.length && product.galleryImages[0] && product.galleryImages[0] !== product.mainImage;
    const inStock = product.stockQuantity !== undefined ? product.stockQuantity > 0 : true;
    const buttonClass = 'bg-[rgb(17,24,39)] hover:bg-[rgb(15,23,42)]';

    return (
      <div className="group relative bg-white border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <Link href={getProductUrl(product)} className="block w-full h-full">
            {product.mainImage ? (
              <>
                <img
                  src={product.mainImage}
                  alt={product.itemName}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                {hasHoverImage && (
                  <img
                    src={hoverImage}
                    alt={product.itemName}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110"
                  />
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
            <button type="button" className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-[#ff006e]'}`} title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'} onClick={handleWishlist}>
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button type="button" className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Compare" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Layers className="h-4 w-4" />
            </button>
            <Link href={getProductUrl(product)} className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Quick View" onClick={(e) => e.stopPropagation()}>
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>
      <div className="px-5 pb-14 pt-4 flex-1 flex flex-col min-h-0 transition-transform duration-300 group-hover:-translate-y-3">
        {product.productCategory?.name && (
          <div className="text-xs font-medium text-gray-500 mb-1">
            {product.productCategory.name}
          </div>
        )}
        <Link href={getProductUrl(product)}>
          <h3 className="product-title leading-snug line-clamp-2 min-h-[20px] hover:text-[#ff006e] transition-colors">
            {product.itemName}
          </h3>
        </Link>
          <div className="mt-3 flex items-end gap-2">
            <span className="product-price">{formatPrice(currentPrice)}</span>
            {maxRetailPrice && maxRetailPrice > currentPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(maxRetailPrice)}</span>
            )}
          </div>
        </div>
        <div className={`absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100 transition-transform duration-300 ${isAdded ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
          <button type="button" onClick={handleAddToCart} disabled={!inStock} className={`w-full rounded-full ${buttonClass} text-white text-sm font-semibold py-3 disabled:opacity-60 transition-colors`}>
            {isAdded ? (
              <span className="flex items-center justify-center gap-2"><span>✓</span><span>Added to Cart</span></span>
            ) : (
              <span className="flex items-center justify-center gap-2"><ShoppingCart className="h-4 w-4" /><span>Add To Cart</span></span>
            )}
          </button>
        </div>
      </div>
    );
  };

  const mrp = product?.maximumRetailPrice || product?.maxRetailPrice || 0;
  const discount = mrp && mrp > (product?.yourPrice || 0)
    ? Math.round(((mrp - (product?.yourPrice || 0)) / mrp) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          _id: product._id,
          itemName: product.itemName,
          mainImage: product.mainImage,
          yourPrice: product.yourPrice,
          freeShipping: product.freeShipping ?? false,
        });
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Add to cart first
      handleAddToCart();
      // Navigate to checkout after a brief delay
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 300);
    }
  };

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPincodeCheckResult({
        available: false,
        message: 'Please enter a valid 6-digit pincode.'
      });
      return;
    }

    // Show loading state
    setPincodeCheckResult({
      available: false,
      message: 'Checking serviceability...'
    });

    try {
      // Get warehouse pincode from environment or use default
      const warehousePincode = process.env.NEXT_PUBLIC_WAREHOUSE_PINCODE || '110001';
      const productWeight = product?.itemWeight || product?.packageWeight || 0.5;

      const response = await checkPincodeServiceability({
        pickup_pincode: warehousePincode,
        delivery_pincode: pincode,
        weight: productWeight,
      });

      if (response.success && response.serviceable) {
        const estimatedDays = response.data?.estimated_days || '3-5';
        setPincodeCheckResult({
          available: true,
          message: `✓ Delivery available to ${pincode}. Estimated delivery: ${estimatedDays} business days.`
        });
      } else {
        setPincodeCheckResult({
          available: false,
          message: `✗ Delivery not available to pincode ${pincode}. ${response.message || 'Please try another pincode.'}`
        });
      }
    } catch (error: any) {
      console.error('Pincode check error:', error);
      setPincodeCheckResult({
        available: false,
        message: error.response?.data?.message || 'Unable to check serviceability. Please try again later.'
      });
    }
  };

  /** Amazon-style: lens in pixels (clamped), zoom panel uses percent. Pixel + percent kept in sync. */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(LENS_SIZE / 2, Math.min(rect.width - LENS_SIZE / 2, x));
    y = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y));
    setZoomPosition({
      px: x,
      py: y,
      percentX: (x / rect.width) * 100,
      percentY: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowZoom(true);
      if (imageRef) {
        const rect = imageRef.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        setZoomPosition({ px: cx, py: cy, percentX: 50, percentY: 50 });
      }
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleImageClick = () => {
    if (!product) return;
    const allImages = product.galleryImages && product.galleryImages.length > 0
      ? [product.mainImage, ...product.galleryImages]
      : [product.mainImage];
    const currentImage = selectedImage || product.mainImage;
    setLightboxOpen(true);
    setLightboxImageIndex(allImages.findIndex(img => img === currentImage));
    setLightboxZoom(1);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setLightboxZoom(1);
    setLightboxShowZoom(false);
  };

  const handleLightboxImageChange = (index: number) => {
    if (!product) return;
    const allImages = product.galleryImages && product.galleryImages.length > 0
      ? [product.mainImage, ...product.galleryImages]
      : [product.mainImage];
    setLightboxImageIndex(index);
    setSelectedImage(allImages[index]);
    setLightboxZoom(1);
    setLightboxShowZoom(false);
  };

  const handleLightboxZoomIn = () => {
    setLightboxZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleLightboxZoomOut = () => {
    setLightboxZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lightboxImageRef || lightboxZoom <= 1) return;
    
    const rect = lightboxImageRef.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));
    
    setLightboxPosition({ x: constrainedX, y: constrainedY });
  };

  const handleLightboxPrev = () => {
    if (!product) return;
    const allImages = product.galleryImages && product.galleryImages.length > 0
      ? [product.mainImage, ...product.galleryImages]
      : [product.mainImage];
    const newIndex = lightboxImageIndex > 0 ? lightboxImageIndex - 1 : allImages.length - 1;
    handleLightboxImageChange(newIndex);
  };

  const handleLightboxNext = () => {
    if (!product) return;
    const allImages = product.galleryImages && product.galleryImages.length > 0
      ? [product.mainImage, ...product.galleryImages]
      : [product.mainImage];
    const newIndex = lightboxImageIndex < allImages.length - 1 ? lightboxImageIndex + 1 : 0;
    handleLightboxImageChange(newIndex);
  };

  useEffect(() => {
    if (!product) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') {
          handleCloseLightbox();
        } else if (e.key === 'ArrowLeft') {
          handleLightboxPrev();
        } else if (e.key === 'ArrowRight') {
          handleLightboxNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImageIndex, product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/shop" className="text-[#ff6b35] hover:text-[#e85a28]">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.galleryImages && product.galleryImages.length > 0
    ? [product.mainImage, ...product.galleryImages]
    : [product.mainImage];

  const plainDescription = product.productDescription ? toPlainText(product.productDescription) : '';

  return (
    <ProductDetailView
      product={product}
      images={images}
      plainDescription={plainDescription}
      discount={discount}
      formatPrice={formatPrice}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
      setImageRef={setImageRef}
      showZoom={showZoom}
      zoomPosition={zoomPosition}
      handleMouseMove={handleMouseMove}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      handleImageClick={handleImageClick}
      lightboxOpen={lightboxOpen}
      setLightboxImageRef={setLightboxImageRef}
      lightboxZoom={lightboxZoom}
      lightboxImageIndex={lightboxImageIndex}
      lightboxPosition={lightboxPosition}
      handleLightboxZoomIn={handleLightboxZoomIn}
      handleLightboxZoomOut={handleLightboxZoomOut}
      handleLightboxMouseMove={handleLightboxMouseMove}
      setLightboxShowZoom={setLightboxShowZoom}
      handleCloseLightbox={handleCloseLightbox}
      handleLightboxPrev={handleLightboxPrev}
      handleLightboxNext={handleLightboxNext}
      handleLightboxImageChange={handleLightboxImageChange}
      quantity={quantity}
      setQuantity={setQuantity}
      handleAddToCart={handleAddToCart}
      addedToCart={addedToCart}
      handleBuyNow={handleBuyNow}
      toggleWishlist={toggleWishlist}
      isInWishlist={isInWishlist}
      handleShare={handleShare}
      handlePincodeCheck={handlePincodeCheck}
      pincode={pincode}
      onPincodeChange={(value) => {
        setPincode(value.replace(/\D/g, '').slice(0, 6));
        setPincodeCheckResult(null);
      }}
      pincodeCheckResult={pincodeCheckResult}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recentlyViewed={recentlyViewed}
      similarProducts={similarProducts}
      loadingSimilar={loadingSimilar}
      renderProductCard={(item) => <ProductCard key={item._id} product={item} />}
      reviewCount={(product as any).reviewCount ?? 0}
      averageRating={(product as any).averageRating ?? (product as any).rating ?? null}
    />
  );
}

