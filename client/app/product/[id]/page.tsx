'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, Check, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, MapPin, Zap, Package, Info, Truck, Shield, FileText, Ruler, Weight, Globe, Battery, Box, Star, Home, Eye, Layers, RefreshCw } from 'lucide-react';
import { getProductById, getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  galleryImages?: string[];
  videoLink?: string;
  productType?: string;
  productId?: string;
  modelNo?: string;
  manufacturerName?: string;
  productDescription?: string;
  bulletPoints?: string[] | string;
  genericKeyword?: string[] | string;
  specialFeatures?: string[] | string;
  itemTypeName?: string;
  partNumber?: string;
  color?: string;
  yourPrice: number;
  maximumRetailPrice?: number;
  maxRetailPrice?: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  stockQuantity?: number;
  itemCondition?: string;
  compatibleDevices?: string[] | string;
  includedComponents?: string[] | string;
  itemDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  itemWeight?: number;
  itemPackageDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  packageDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  packageWeight?: number;
  hsnCode?: string;
  countryOfOrigin?: string;
  warrantyDescription?: string;
  areBatteriesRequired?: boolean;
  batteriesRequired?: boolean;
  importerContactInformation?: string;
  importerContactInfo?: string;
  packerContactInformation?: string;
  packerContactInfo?: string;
  productCategory?: {
    name: string;
    _id: string;
    slug?: string;
  };
  subCategory?: {
    name: string;
    _id: string;
  };
  productSubCategory?: {
    name: string;
    _id: string;
  };
  isFeatured?: boolean;
  isActive?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0, percentX: 0, percentY: 0 });
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
          <Link href={`/product/${product._id}`} className="block w-full h-full">
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
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded">-{discount}%</span>
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-3 left-3 z-20" style={{ top: discount > 0 ? '3.5rem' : '0.75rem' }}>
              <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded">Hot</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 z-20">
            <button type="button" className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-[#ff006e]'}`} title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'} onClick={handleWishlist}>
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button type="button" className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Compare" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Layers className="h-4 w-4" />
            </button>
            <Link href={`/product/${product._id}`} className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Quick View" onClick={(e) => e.stopPropagation()}>
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="px-5 pb-5 pt-4 flex-1 flex flex-col min-h-0 transition-transform duration-300 group-hover:-translate-y-3">
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

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      // Mock pincode check - replace with actual API call
      const isValidPincode = /^\d{6}$/.test(pincode);
      if (isValidPincode) {
        setPincodeCheckResult({
          available: true,
          message: `Delivery available to ${pincode}. Estimated delivery: 3-5 business days.`
        });
      } else {
        setPincodeCheckResult({
          available: false,
          message: 'Please enter a valid 6-digit pincode.'
        });
      }
    } else {
      setPincodeCheckResult({
        available: false,
        message: 'Please enter a 6-digit pincode.'
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef) return;
    
    const rect = imageRef.getBoundingClientRect();
    const lensSize = 150; // Size of zoom lens in pixels
    const halfLens = lensSize / 2;
    
    // Calculate mouse position relative to image
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Constrain lens position to stay within image bounds
    const maxX = rect.width - halfLens;
    const maxY = rect.height - halfLens;
    
    const constrainedX = Math.max(halfLens, Math.min(maxX, mouseX));
    const constrainedY = Math.max(halfLens, Math.min(maxY, mouseY));
    
    // Calculate percentage for background position
    const percentX = (constrainedX / rect.width) * 100;
    const percentY = (constrainedY / rect.height) * 100;
    
    setZoomPosition({ 
      x: constrainedX, 
      y: constrainedY,
      percentX,
      percentY
    });
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
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

  // Plain-text excerpt of description for summary areas (strip HTML tags)
  const plainDescription = product.productDescription
    ? product.productDescription
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

  return (
    <div className="min-h-screen text-[#2d3748]" style={{ backgroundColor: 'rgb(239 239 239 / 33%)' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:mb-12">
        {/* Breadcrumb – HTML style */}
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

        {/* Product grid – white card, HTML layout */}
        <div className="grid lg:grid-cols-2 gap-12 bg-white p-6 sm:p-8 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] mb-12">
          {/* Image gallery – sticky, HTML styling; zoom logic unchanged */}
          <div className="sticky top-[100px] h-fit">
            <div className="relative mb-4 group">
              <div
                ref={setImageRef}
                className="aspect-square rounded-lg overflow-hidden relative cursor-zoom-in flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
              >
                <img
                  src={selectedImage || product.mainImage}
                  alt={product.itemName}
                  className="w-full h-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-[1.02]"
                  draggable={false}
                />
                {/* Zoom lens – kept as is */}
                {showZoom && (
                  <div
                    className="absolute pointer-events-none border-2 border-[#ff6b35] bg-white/90 shadow-xl"
                    style={{
                      width: '150px',
                      height: '150px',
                      left: `${zoomPosition.x}px`,
                      top: `${zoomPosition.y}px`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      zIndex: 10,
                    }}
                  />
                )}
              </div>
              {/* Zoom icon button – opens lightbox (HTML style) */}
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#4a5568] hover:text-[#ff6b35] transition-colors"
                aria-label="Zoom"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              {/* Large zoom panel – kept as is */}
              {showZoom && (
                <div
                  className="hidden xl:block absolute left-[calc(100%+24px)] top-0 w-[400px] h-[400px] overflow-hidden z-20 pointer-events-none rounded-lg"
                  style={{
                    backgroundImage: `url(${selectedImage || product.mainImage})`,
                    backgroundSize: '300%',
                    backgroundPosition: `${zoomPosition.percentX}% ${zoomPosition.percentY}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}
            </div>
            {/* Thumbnails – single row, horizontal scroll when many images */}
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
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lightbox Modal */}
          {lightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-[95vw] h-[75vh] flex bg-white shadow-2xl overflow-hidden">
                {/* Main Image Area - Left Side */}
                <div className="flex-1 flex items-center justify-center relative bg-gray-50">
                  {/* Navigation Arrows - Only show if multiple images */}
                  {(() => {
                    if (!product) return false;
                    const allImages = product.galleryImages && product.galleryImages.length > 0
                      ? [product.mainImage, ...product.galleryImages]
                      : [product.mainImage];
                    return allImages.length > 1;
                  })() && (
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

                  {/* Image Container with Zoom */}
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
                      src={(() => {
                        if (!product) return '';
                        const allImages = product.galleryImages && product.galleryImages.length > 0
                          ? [product.mainImage, ...product.galleryImages]
                          : [product.mainImage];
                        return allImages[lightboxImageIndex] || product.mainImage;
                      })()}
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

                {/* Product Details Sidebar - Right Side */}
                <div className="w-full sm:w-[400px] bg-white border-l border-gray-200 flex flex-col">
                  {/* Header with Close Button */}
                  <div className="flex items-start justify-end p-4 border-b border-gray-200">
                    {/* Close Button */}
                    <button
                      onClick={handleCloseLightbox}
                      className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Product Title and Images */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Product Title with Zoom Controls */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        {/* Zoom Controls - Left of Title */}
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
                        
                        {/* Product Title */}
                        <div className="flex-1">
                          <h2 className="text-base font-normal text-gray-900 leading-relaxed">
                            {product.itemName}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Images Grid */}
                    {product && (() => {
                      const allImages = product.galleryImages && product.galleryImages.length > 0
                        ? [product.mainImage, ...product.galleryImages]
                        : [product.mainImage];
                      return (
                        <div>
                          <div className="grid grid-cols-3 gap-2">
                            {allImages.map((img, index) => (
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
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Info – HTML layout */}
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-bold text-[#1a202c] leading-tight">
              {product.itemName}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-[#fbbf24] text-lg tracking-wider" aria-hidden>★★★★★</div>
              <div className="text-[#4a5568] text-[0.9rem]">
                4.8 (256 reviews) | <Link href="#reviews" className="text-[#4299e1] hover:underline">Write a review</Link>
              </div>
            </div>

            {/* Price section – HTML: grey bg, orange left border */}
            <div className="p-6 bg-[#f7fafc] rounded-lg border-l-4 border-[#ff6b35]">
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-[2.5rem] font-bold text-[#ff6b35]">
                  {formatPrice(product.yourPrice)}
                </span>
                {(() => {
                  const productMrp = product.maximumRetailPrice || product.maxRetailPrice;
                  return productMrp && productMrp > product.yourPrice && (
                    <>
                      <span className="text-[1.2rem] text-[#a0aec0] line-through ml-1">
                        {formatPrice(productMrp)}
                      </span>
                      {discount > 0 && (
                        <span className="ml-4 px-3 py-1 bg-[#fef5e7] text-[#d69e2e] rounded text-[0.9rem] font-semibold">
                          Save {discount}%
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              {product.stockQuantity !== undefined && (
                <div className={`mt-3 flex items-center gap-2 font-semibold ${
                  product.stockQuantity > 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'
                }`}>
                  <Check className={`h-4 w-4 flex-shrink-0 ${product.stockQuantity > 0 ? '' : 'hidden'}`} />
                  {product.stockQuantity > 0 ? (
                    <>In Stock - {product.stockQuantity} units available</>
                  ) : (
                    <>Out of Stock</>
                  )}
                </div>
              )}
            </div>

            {plainDescription && (
              <p className="text-[#4a5568] text-[1.05rem] leading-[1.7] line-clamp-4">
                {plainDescription}
              </p>
            )}

            {/* Pincode – Check Delivery */}
            <div className="pb-4 border-b border-[#e2e8f0]">
              <form onSubmit={handlePincodeCheck} className="space-y-3">
                <label className="block font-semibold text-[#2d3748] mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#ff6b35]" />
                  Check Delivery & Serviceability
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setPincodeCheckResult(null);
                    }}
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
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    pincodeCheckResult.available
                      ? 'bg-[#c6f6d5] text-[#22543d]'
                      : 'bg-[#fed7d7] text-[#742a2a]'
                  }`}>
                    {pincodeCheckResult.available ? '✓' : '✗'} {pincodeCheckResult.message}
                  </div>
                )}
              </form>
            </div>

            {/* Quantity – HTML: grey control */}
            <div className="pb-4 border-b border-[#e2e8f0]">
              <div className="font-semibold text-[#2d3748] mb-3">Quantity</div>
              <div className="flex items-center gap-4">
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
            </div>

            {/* Action buttons – HTML: primary orange, secondary outline, icon */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`flex-1 min-w-[140px] py-4 px-8 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
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
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className={`py-4 px-8 rounded-lg font-semibold flex items-center justify-center gap-2 border-2 border-[#ff6b35] text-[#ff6b35] bg-white hover:bg-[#fff5f2] transition-colors ${
                  product.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Zap className="h-5 w-5" /> Buy Now
              </button>
              <button
                type="button"
                onClick={() => product && toggleWishlist(product._id)}
                className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f7fafc] text-[#4a5568] hover:bg-[#edf2f7] transition-colors"
                title="Wishlist"
              >
                <Heart className={`h-5 w-5 ${product && isInWishlist(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button
                type="button"
                className="p-4 rounded-lg border border-[#e2e8f0] bg-[#f7fafc] text-[#4a5568] hover:bg-[#edf2f7] transition-colors"
                title="Share"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
            </div>

            {/* Features – HTML: 2-col grid, grey bg, checkmarks */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-[#f7fafc] rounded-lg">
              <div className="flex items-center gap-3 text-[0.9rem]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>Free shipping on orders over ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>2-year manufacturer warranty</span>
              </div>
              <div className="flex items-center gap-3 text-[0.9rem]">
                <span className="text-[#48bb78] text-lg">✓</span>
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs – HTML style */}
        <div className="mt-12">
          {/* Tabs: horizontally scrollable on small screens so last tab is always reachable */}
          <nav
            className="flex gap-2 border-b-2 border-[#e2e8f0] mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
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

          <div className="bg-white p-8 rounded-lg shadow-sm">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-8 text-gray-800">
                <h2 className="text-xl font-bold text-gray-900">Product Description</h2>
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
                    ? product.bulletPoints.split(',').map(s => s.trim()).filter(Boolean)
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
                    ? product.specialFeatures.split(',').map(s => s.trim()).filter(Boolean)
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

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 w-full">
                <div className="flex items-start justify-between pb-8 border-b-2 border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-5xl font-bold bg-gradient-to-r from-[#ff6b35] to-[#4299e1] bg-clip-text text-transparent">4.8</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Based on 120 customer reviews</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#4299e1] text-white text-sm font-bold hover:from-[#e85a28] hover:to-[#3182ce] transition-all rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
                      <span className="text-sm font-bold text-gray-900 w-12 text-right">{[53, 34, 10, 2, 1][5 - rating]}%</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-200 bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#4299e1] flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">John D.</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Verified Purchase</span>
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

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (() => {
              const specRows: { label: string; value: string }[] = [];
              if (product.productType) specRows.push({ label: 'Product Type', value: product.productType });
              if (product.modelNo) specRows.push({ label: 'Model Number', value: product.modelNo });
              if (product.brandName) specRows.push({ label: 'Brand', value: product.brandName });
              if (product.productId) specRows.push({ label: 'Product ID', value: product.productId });
              if (product.partNumber) specRows.push({ label: 'Part Number', value: product.partNumber });
              if (product.color) specRows.push({ label: 'Color', value: product.color });
              if (product.itemCondition) specRows.push({ label: 'Condition', value: product.itemCondition });
              if (product.manufacturerName) specRows.push({ label: 'Manufacturer', value: product.manufacturerName });
              if (product.itemDimensions && (product.itemDimensions.length || product.itemDimensions.width || product.itemDimensions.height)) {
                const d = product.itemDimensions;
                specRows.push({ label: 'Dimensions', value: `${d.length ?? '-'} × ${d.width ?? '-'} × ${d.height ?? '-'} ${d.unit || 'cm'}` });
              }
              if (product.itemWeight != null) specRows.push({ label: 'Weight', value: `${product.itemWeight} kg` });
              if (product.countryOfOrigin) specRows.push({ label: 'Country of Origin', value: product.countryOfOrigin });
              if (product.hsnCode) specRows.push({ label: 'HSN Code', value: product.hsnCode });
              if (product.warrantyDescription) specRows.push({ label: 'Warranty', value: product.warrantyDescription });
              return (
                <div className="bg-white w-full overflow-hidden">
                  <dl className="divide-y divide-[#e0e0e0]">
                    {specRows.map((row, index) => (
                      <div key={index} className="flex justify-between items-center py-4 px-4 sm:px-6 text-sm">
                        <dt className="text-[#4a4a4a] font-semibold pr-4">{row.label}</dt>
                        <dd className="text-[#333] font-normal text-left flex-1">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })()}

            {/* Shipping & Returns Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-10 max-w-3xl text-gray-800">
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
                    We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, we offer a 30-day money-back guarantee.
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

        {/* Recently Viewed – HTML style */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[1.75rem] font-bold text-[#1a202c] mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentlyViewed.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

        {/* You May Also Like – HTML style */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[1.75rem] font-bold text-[#1a202c] mb-6">
              You May Also Like
            </h2>
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
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
