'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Star, Heart, Eye, Layers, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { getProducts, getCategories, getSubCategories } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import QuickViewDialog from '@/components/QuickViewDialog';

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

        {/* Discount Badge - Top Left (match category style) */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded">
              -{discount}%
            </span>
          </div>
        )}

        {/* Hot Badge - Top Left (below discount if both exist) */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 z-20" style={{ top: discount > 0 ? '3.5rem' : '0.75rem' }}>
            <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded">
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
          <Link
            href={`/product/${product._id}`}
            className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#ff006e] transition-colors"
            title="Quick View"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content - title, rating, price, stock always visible; Add to Cart in same section, appears on hover */}
      <div className="px-5 pb-5 pt-4 flex-1 flex flex-col min-h-0">
        <Link href={`/product/${product._id}`}>
          <h3 className="product-title leading-snug line-clamp-2 min-h-[20px] hover:text-[#ff006e] transition-colors">
            {product.itemName}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center text-[#f5a623] text-sm leading-none">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < 4 ? 'fill-[#f5a623] text-[#f5a623]' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">2 reviews</span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="product-price">
            {formatPrice(currentPrice)}
          </span>
          {maxRetailPrice && maxRetailPrice > currentPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(maxRetailPrice)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className={inStock ? 'text-green-600' : 'text-red-600'}>✓</span>
          <span className={inStock ? 'text-green-600' : 'text-red-600'}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        {/* Add to Cart - same section, slides up into view on hover without hiding price */}
        <div className="mt-4 min-h-[44px] flex items-end">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full rounded-full ${buttonClass} text-white text-sm font-semibold py-3 disabled:opacity-60 transition-all duration-300 ${
              isAdded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
            }`}
          >
            {isAdded ? (
              <span className="flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Added to Cart</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Add To Cart</span>
              </span>
            )}
          </button>
        </div>
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

    return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <span>/</span>
            <span className="text-gray-900 font-medium">Shop</span>
            </nav>
          </div>
        </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                      name="category"
                          checked={!selectedCategory}
                          onChange={() => handleCategoryChange('')}
                      className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">
                      All Categories ({totalProducts})
                    </span>
                      </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                        name="category"
                        checked={selectedCategory === cat._id}
                        onChange={() => handleCategoryChange(cat._id)}
                        className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                      <span className="text-sm text-gray-700 group-hover:text-purple-600">
                        {cat.name}
                      </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subcategories */}
                  {selectedCategory && subCategories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Subcategories</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <label className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                        name="subcategory"
                            checked={!selectedSubCategory}
                            onChange={() => handleSubCategoryChange('')}
                        className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                      <span className="text-sm text-gray-700 group-hover:text-purple-600">All</span>
                        </label>
                    {subCategories.map((subCat) => (
                      <label key={subCat._id} className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                          name="subcategory"
                          checked={selectedSubCategory === subCat._id}
                          onChange={() => handleSubCategoryChange(subCat._id)}
                          className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                        <span className="text-sm text-gray-700 group-hover:text-purple-600">{subCat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Max"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </div>
                    </div>
                  </div>

                  {/* Brands */}
                  {availableBrands.length > 0 && (
                    <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => handleBrandToggle(brand)}
                          className="mr-3 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                        <span className="text-sm text-gray-700 group-hover:text-purple-600">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Customer Rating */}
                  <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[5, 4].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => handleRatingChange(rating)}
                        className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                            }`}
                      />
                        ))}
                        {rating === 5 && <span className="text-xs text-gray-500 ml-1">(50)</span>}
                        {rating === 4 && <span className="text-xs text-gray-500 ml-1">(100)</span>}
                      </div>
                    </label>
                  ))}
                  </div>
              </div>
                </div>
              </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Shop Banner */}
            <div className="bg-gray-100 mb-6 p-8 relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-block bg-purple-600 text-white px-3 py-1 text-xs font-bold mb-3">
                  Over {totalProducts} Products
                      </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
                <p className="text-gray-600 max-w-2xl">
                  Explore our complete collection of high-quality products for every need. Discover our range of premium items offering outstanding quality, comfort, and style.
                  </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                {totalProducts} Products found
              </p>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-700">Sort by:</label>
                    <select
                      value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                  <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                    </select>
                  </div>
            </div>

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
                  href="/"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Back to Home
                </Link>
              </div>
            )}
          </div>
          </div>
        </div>

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
