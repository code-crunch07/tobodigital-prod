'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, Heart, Eye, Layers, ChevronLeft, ChevronRight, Home, Filter, X, ChevronDown, Tag } from 'lucide-react';
import { getProducts, getCategories, getSubCategories } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import QuickViewDialog from '@/components/QuickViewDialog';
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
    _id: string;
    name: string;
  };
  productSubCategory?: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

// ProductCard component - matching homepage design
const ProductCard = ({ 
  product, 
  addedItems, 
  setAddedItems, 
  addToCart, 
  formatPrice,
  onQuickView
}: { 
  product: Product; 
  addedItems: Set<string>;
  setAddedItems: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  addToCart: (item: any) => void;
  formatPrice: (price: number) => string;
  onQuickView: (product: Product) => void;
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Calculate discount from maxRetailPrice or salePrice
  let discount = 0;
  const maxRetailPrice = product.maximumRetailPrice || product.maxRetailPrice;
  const salePrice = product.salePrice;
  
  // Check if sale is currently active based on dates
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
    e.stopPropagation();
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  // Hover image: use second gallery image if available
  const hoverImage = (product.galleryImages?.length && product.galleryImages[0]) ? product.galleryImages[0] : product.mainImage;
  const hasHoverImage = product.galleryImages?.length && product.galleryImages[0] && product.galleryImages[0] !== product.mainImage;

  // Match category carousel: white card, content shift -translate-y-3, button in absolute strip that slides up
  const inStock = product.stockQuantity !== undefined ? product.stockQuantity > 0 : true;
  const buttonClass = 'bg-[rgb(17,24,39)] hover:bg-[rgb(15,23,42)]';

  return (
    <div className="group relative bg-white border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
      {/* Product Image - swap on hover when gallery has second image */}
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

        {/* Sale badge - tag style with brand color (use ternary so we never render 0) */}
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

        {/* Hot Badge - Top Left (below discount if both exist) */}
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

        {/* Action Icons - Right (slide in on hover like category) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 z-20">
          <button
            type="button"
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center transition-colors ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-[#ff006e]'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors"
            title="Compare"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button type="button" className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors" title="Quick View" onClick={handleQuickView}>
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-14 pt-4 flex-1 flex flex-col min-h-0 transition-transform duration-300 group-hover:-translate-y-3">
<Link href={getProductUrl(product)}>
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

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 5000]);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>('PRICE');

  useEffect(() => {
    loadCategories();
    // Check URL params for category filter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadSubCategories();
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, selectedSubCategory, selectedBrands, priceRange, sortBy, selectedRating]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubCategories = async () => {
    if (!selectedCategory) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await getSubCategories(selectedCategory);
      setSubCategories(response.data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubCategory) params.subcategory = selectedSubCategory;
      if (selectedBrands.length > 0) params.brands = selectedBrands.join(',');
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 100000) params.maxPrice = priceRange[1];

      // Map sortBy to backend sort parameter
      const sortMap: Record<string, string> = {
        'popularity': 'newest',
        'price-low': 'price-low',
        'price-high': 'price-high',
        'newest': 'newest',
        'oldest': 'oldest',
      };
      params.sort = sortMap[sortBy] || 'newest';

      const response = await getProducts(params);
      const productsData = response.data?.products || [];
      
      // Filter by rating if selected
      let filteredProducts = productsData;
      if (selectedRating !== null) {
        // For now, we'll show all products as we don't have rating data
        // In a real implementation, you'd filter by actual product ratings
      }
      
      setProducts(filteredProducts);
      setTotalPages(response.data?.pagination?.pages || 1);
      setTotalProducts(response.data?.pagination?.total || 0);

      // Extract unique brands from products
      const brands = Array.from(new Set(productsData.map((p: Product) => p.brandName).filter(Boolean))) as string[];
      setAvailableBrands(brands);
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
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setPage(1);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setPage(1);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    setPage(1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setPage(1);
  };

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const handleRemoveAllFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedBrands([]);
    setPriceRange([1000, 5000]);
    setSelectedRating(null);
    setPage(1);
  };

    return (
    <>
    <div className="min-h-screen bg-white">
      {/* Top banner – dark with "Shop" title + breadcrumb (matching category layout) */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #059669 0%, transparent 50%), linear-gradient(-45deg, #2563eb 0%, transparent 50%)' }} />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Shop</h1>
          <nav className="flex items-center justify-center gap-2 text-sm text-white/90">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar: Filter button (left) + product count & sort (right) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {(() => {
            const hasActiveFilters = selectedCategory || selectedSubCategory || selectedBrands.length > 0 || priceRange[0] !== 1000 || priceRange[1] !== 5000 || selectedRating !== null;
            return (
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 bg-[#ff006e] text-white px-4 py-2.5 rounded font-semibold text-sm hover:bg-[#d4005a] transition-colors"
              >
                {hasActiveFilters && <span className="text-white">✓</span>}
                <Filter className="h-4 w-4" />
                FILTER
              </button>
            );
          })()}
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">{totalProducts} products</span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#ff006e] focus:border-[#ff006e] bg-white"
              >
                <option value="popularity">Best selling</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content - full width */}
          <div className="w-full min-w-0">

            {/* Pagination Top */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded ${
                    page === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                  <ChevronLeft className="h-5 w-5" />
                  </button>
                {Array.from({ length: Math.min(totalPages, 11) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 11) {
                    pageNum = i + 1;
                  } else if (page <= 6) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 5) {
                    pageNum = totalPages - 10 + i;
                  } else {
                    pageNum = page - 5 + i;
                  }
                  return (
                  <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        page === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                      {pageNum}
                  </button>
                  );
                })}
                      <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className={`p-2 rounded ${
                    page === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                      >
                  <ChevronRight className="h-5 w-5" />
                      </button>
              </div>
            )}

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id}
                      product={product}
                      addedItems={addedItems}
                      setAddedItems={setAddedItems}
                      addToCart={addToCart}
                      formatPrice={formatPrice}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>

                {/* Pagination Bottom */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                      className={`px-4 py-2 rounded font-medium ${
                      page === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                    {Array.from({ length: Math.min(totalPages, 11) }, (_, i) => {
                    let pageNum;
                      if (totalPages <= 11) {
                      pageNum = i + 1;
                      } else if (page <= 6) {
                      pageNum = i + 1;
                      } else if (page >= totalPages - 5) {
                        pageNum = totalPages - 10 + i;
                    } else {
                        pageNum = page - 5 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded font-medium ${
                          page === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                      className={`px-4 py-2 rounded font-medium ${
                      page === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <Link
                  href="/shop"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>

      {/* Filter drawer – matching category layout, brand color #ff006e */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFilterOpen(false)} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto border border-gray-200 flex flex-col">
            {/* Header: grey bar, FILTER left, close right */}
            <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Filter</h2>
              <button type="button" onClick={() => setFilterOpen(false)} className="p-1.5 text-gray-600 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Product count */}
            <div className="flex justify-end px-4 py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">{totalProducts} products</span>
            </div>
            {/* Expandable filter sections */}
            <div className="flex-1 overflow-y-auto">
              {/* PRICE */}
              <div className="border-b border-gray-200">
                <button type="button" onClick={() => setExpandedFilter(expandedFilter === 'PRICE' ? null : 'PRICE')} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                  <span className="text-sm font-bold text-gray-900 uppercase">Price</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedFilter === 'PRICE' ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilter === 'PRICE' && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex gap-2">
                      <input type="number" value={priceRange[0]} onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#ff006e] focus:border-[#ff006e]" placeholder="Min" />
                      <input type="number" value={priceRange[1]} onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#ff006e] focus:border-[#ff006e]" placeholder="Max" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}</p>
                  </div>
                )}
              </div>
              {/* CATEGORY */}
              <div className="border-b border-gray-200">
                <button type="button" onClick={() => setExpandedFilter(expandedFilter === 'CATEGORY' ? null : 'CATEGORY')} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                  <span className="text-sm font-bold text-gray-900 uppercase">Category</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedFilter === 'CATEGORY' ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilter === 'CATEGORY' && (
                  <div className="px-4 pb-4 pt-0 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="category" checked={!selectedCategory} onChange={() => handleCategoryChange('')} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                        <span className="text-sm text-gray-700">All Categories</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center cursor-pointer">
                          <input type="radio" name="category" checked={selectedCategory === cat._id} onChange={() => handleCategoryChange(cat._id)} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* SUBCATEGORY */}
              {selectedCategory && subCategories.length > 0 && (
                <div className="border-b border-gray-200">
                  <button type="button" onClick={() => setExpandedFilter(expandedFilter === 'SUBCATEGORY' ? null : 'SUBCATEGORY')} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                    <span className="text-sm font-bold text-gray-900 uppercase">Subcategory</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedFilter === 'SUBCATEGORY' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFilter === 'SUBCATEGORY' && (
                    <div className="px-4 pb-4 pt-0 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="subcategory" checked={!selectedSubCategory} onChange={() => handleSubCategoryChange('')} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                          <span className="text-sm text-gray-700">All</span>
                        </label>
                        {subCategories.map((subCat) => (
                          <label key={subCat._id} className="flex items-center cursor-pointer">
                            <input type="radio" name="subcategory" checked={selectedSubCategory === subCat._id} onChange={() => handleSubCategoryChange(subCat._id)} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                            <span className="text-sm text-gray-700">{subCat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* BRAND */}
              {availableBrands.length > 0 && (
                <div className="border-b border-gray-200">
                  <button type="button" onClick={() => setExpandedFilter(expandedFilter === 'BRAND' ? null : 'BRAND')} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                    <span className="text-sm font-bold text-gray-900 uppercase">Brand</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedFilter === 'BRAND' ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFilter === 'BRAND' && (
                    <div className="px-4 pb-4 pt-0 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {availableBrands.map((brand) => (
                          <label key={brand} className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => handleBrandToggle(brand)} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                            <span className="text-sm text-gray-700">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* RATING */}
              <div className="border-b border-gray-200">
                <button type="button" onClick={() => setExpandedFilter(expandedFilter === 'RATING' ? null : 'RATING')} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
                  <span className="text-sm font-bold text-gray-900 uppercase">Rating</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedFilter === 'RATING' ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilter === 'RATING' && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="rating" checked={selectedRating === null} onChange={() => handleRatingChange(null)} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                        <span className="text-sm text-gray-700">All Ratings</span>
                      </label>
                      {[5, 4].map((rating) => (
                        <label key={rating} className="flex items-center cursor-pointer">
                          <input type="radio" name="rating" checked={selectedRating === rating} onChange={() => handleRatingChange(rating)} className="mr-3 w-4 h-4 text-[#ff006e] rounded border-gray-300 focus:ring-[#ff006e]" />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Bottom: Remove all + APPLY */}
            <div className="border-t border-gray-200 p-4 bg-white flex items-center justify-between gap-4">
              <button type="button" onClick={handleRemoveAllFilters} className="text-sm font-medium text-gray-900 hover:text-[#ff006e] transition-colors">
                Remove all
              </button>
              <button type="button" onClick={() => setFilterOpen(false)} className="flex-1 max-w-[140px] bg-[#ff006e] text-white py-3 rounded font-bold text-sm uppercase tracking-wide hover:bg-[#d4005a] transition-colors">
                Apply
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick View Dialog */}
      {quickViewProduct && (
        <QuickViewDialog
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          formatPrice={formatPrice}
        />
      )}
    </div>
    </>
  );
}

function ShopPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff006e]"></div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  );
}
