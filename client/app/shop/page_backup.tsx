'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Check, Filter, X, SlidersHorizontal, Grid3x3, List, ChevronDown, Star, Home } from 'lucide-react';
import { getProducts, getCategories, getSubCategories } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  yourPrice: number;
  maximumRetailPrice?: number;
  salePrice?: number;
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

// ProductCard component
const ProductCard = ({ 
  product, 
  viewMode, 
  addedItems, 
  setAddedItems, 
  addToCart, 
  formatPrice 
}: { 
  product: Product; 
  viewMode: 'grid' | 'list';
  addedItems: Set<string>;
  setAddedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  addToCart: (item: any) => void;
  formatPrice: (price: number) => string;
}) => {
  const discount = product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice
    ? Math.round(((product.maximumRetailPrice - product.yourPrice) / product.maximumRetailPrice) * 100)
    : 0;
  const isAdded = addedItems.has(product._id);

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

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex gap-4 p-4">
          <Link href={`/product/${product._id}`} className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 relative overflow-hidden bg-gray-100 rounded-lg">
              {product.mainImage ? (
                <img
                  src={product.mainImage}
                  alt={product.itemName}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{discount}%
                </span>
              )}
            </div>
          </Link>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">{product.brandName}</p>
              <Link href={`/product/${product._id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-500 transition-colors line-clamp-2">
                  {product.itemName}
                </h3>
              </Link>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">(4.5)</span>
              </div>
              {product.stockQuantity !== undefined && (
                <div className="mb-2">
                  {product.stockQuantity > 0 ? (
                    <span className="text-xs text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold" style={{ color: 'rgb(237, 130, 79)' }}>
                  {formatPrice(product.yourPrice)}
                </span>
                {product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.maximumRetailPrice)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`p-2 rounded-full transition-colors ${
                  isAdded
                    ? 'bg-green-500 text-white'
                    : product.stockQuantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white'
                }`}
                style={!isAdded && product.stockQuantity !== 0 ? { backgroundColor: 'rgb(22, 176, 238)' } : {}}
                onMouseEnter={(e) => {
                  if (!isAdded && product.stockQuantity !== 0) {
                    e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded && product.stockQuantity !== 0) {
                    e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
                  }
                }}
                title="Add to Cart"
              >
                {isAdded ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
      <Link href={`/product/${product._id}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.itemName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{discount}%
            </span>
          )}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.brandName}</p>
        <Link href={`/product/${product._id}`}>
          <h3 className="font-medium text-sm text-gray-900 mb-2 hover:text-orange-500 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.itemName}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold" style={{ color: 'rgb(237, 130, 79)' }}>
              {formatPrice(product.yourPrice)}
            </span>
            {product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.maximumRetailPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {product.stockQuantity !== undefined && (
            <div>
              {product.stockQuantity > 0 ? (
                <span className="text-xs text-green-600 font-medium">In Stock</span>
              ) : (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`p-2 rounded-full transition-colors ${
              isAdded
                ? 'bg-green-500 text-white'
                : product.stockQuantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-white'
            }`}
            style={!isAdded && product.stockQuantity !== 0 ? { backgroundColor: 'rgb(22, 176, 238)' } : {}}
            onMouseEnter={(e) => {
              if (!isAdded && product.stockQuantity !== 0) {
                e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAdded && product.stockQuantity !== 0) {
                e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)';
              }
            }}
            title="Add to Cart"
          >
            {isAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(searchParams.get('subcategory') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  
  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.brandName).filter(Boolean)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
        limit: 24,
        sort: sortBy,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubCategory) params.subcategory = selectedSubCategory;
      if (searchQuery) params.search = searchQuery;
      if (selectedBrands.length > 0) params.brands = selectedBrands.join(',');
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 100000) params.maxPrice = priceRange[1];
      if (inStockOnly) params.inStock = true;

      const response = await getProducts(params);
      setProducts(response.data?.products || []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setTotalProducts(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadSubCategories();
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, selectedSubCategory, selectedBrands, priceRange, sortBy, searchQuery, inStockOnly]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setPage(1);
    updateURL({ category: categoryId, subcategory: '' });
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setPage(1);
    updateURL({ subcategory: subCategoryId });
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

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
    updateURL({ sort });
  };

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/shop?${newParams.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setInStockOnly(false);
    setSearchQuery('');
    setPage(1);
    router.push('/shop');
  };

  const hasActiveFilters = 
    selectedCategory || 
    selectedSubCategory || 
    selectedBrands.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 100000 || 
    inStockOnly || 
    searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div 
        className="relative h-[250px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, rgba(237, 130, 79, 0.95) 0%, rgba(22, 176, 238, 0.95) 100%), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop</h1>
          <nav className="flex items-center justify-center gap-2 text-white/90">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Off-Canvas Filter Overlay - Mobile & Desktop */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowFilters(false)}
            />
            <aside className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {hasActiveFilters && (
                  <div className="mb-4">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={!selectedCategory}
                        onChange={() => handleCategoryChange('')}
                        className="mr-2"
                        style={{ accentColor: 'rgb(237, 130, 79)' }}
                      />
                      <span className="text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === category._id}
                          onChange={() => handleCategoryChange(category._id)}
                          className="mr-2"
                          style={{ accentColor: 'rgb(237, 130, 79)' }}
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subcategories */}
                {selectedCategory && subCategories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Subcategories</h3>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="subcategory-mobile"
                          checked={!selectedSubCategory}
                          onChange={() => handleSubCategoryChange('')}
                          className="mr-2"
                          style={{ accentColor: 'rgb(237, 130, 79)' }}
                        />
                        <span className="text-sm text-gray-700">All Subcategories</span>
                      </label>
                      {subCategories.map((subCategory) => (
                        <label key={subCategory._id} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="subcategory-mobile"
                            checked={selectedSubCategory === subCategory._id}
                            onChange={() => handleSubCategoryChange(subCategory._id)}
                            className="mr-2"
                            style={{ accentColor: 'rgb(237, 130, 79)' }}
                          />
                          <span className="text-sm text-gray-700">{subCategory.name}</span>
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
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = ''}
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Brands</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="mr-2"
                            style={{ accentColor: 'rgb(237, 130, 79)' }}
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Filter */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="mr-2"
                      style={{ accentColor: 'rgb(237, 130, 79)' }}
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-colors mt-4"
                  style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                >
                  Apply Filters
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Desktop Sidebar Filters - Always hidden, using off-canvas instead */}
        <div className="hidden">
          <aside className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" style={{ color: 'rgb(237, 130, 79)' }} />
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCategory}
                    onChange={() => handleCategoryChange('')}
                    className="mr-2"
                    style={{ accentColor: 'rgb(237, 130, 79)' }}
                  />
                  <span className="text-sm text-gray-700">All Categories</span>
                </label>
                {categories.map((category) => (
                  <label key={category._id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category._id}
                      onChange={() => handleCategoryChange(category._id)}
                      className="mr-2"
                      style={{ accentColor: 'rgb(237, 130, 79)' }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            {selectedCategory && subCategories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Subcategories</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="subcategory"
                      checked={!selectedSubCategory}
                      onChange={() => handleSubCategoryChange('')}
                      className="mr-2"
                      style={{ accentColor: 'rgb(237, 130, 79)' }}
                    />
                    <span className="text-sm text-gray-700">All Subcategories</span>
                  </label>
                  {subCategories.map((subCategory) => (
                    <label key={subCategory._id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="subcategory"
                        checked={selectedSubCategory === subCategory._id}
                        onChange={() => handleSubCategoryChange(subCategory._id)}
                        className="mr-2"
                        style={{ accentColor: 'rgb(237, 130, 79)' }}
                      />
                      <span className="text-sm text-gray-700">{subCategory.name}</span>
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
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
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
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="mr-2"
                        style={{ accentColor: 'rgb(237, 130, 79)' }}
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="mr-2"
                  style={{ accentColor: 'rgb(237, 130, 79)' }}
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                      {[
                        selectedCategory ? 1 : 0,
                        selectedSubCategory ? 1 : 0,
                        selectedBrands.length,
                        (priceRange[0] > 0 || priceRange[1] < 100000) ? 1 : 0,
                        inStockOnly ? 1 : 0,
                        searchQuery ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </button>
                <p className="text-sm text-gray-600">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgb(237, 130, 79)' } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {categories.find(c => c._id === selectedCategory)?.name}
                      <button
                        onClick={() => handleCategoryChange('')}
                        className="hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedSubCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {subCategories.find(sc => sc._id === selectedSubCategory)?.name}
                      <button
                        onClick={() => handleSubCategoryChange('')}
                        className="hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedBrands.map((brand) => (
                    <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {brand}
                      <button
                        onClick={() => handleBrandToggle(brand)}
                        className="hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      <button
                        onClick={() => handlePriceRangeChange(0, 100000)}
                        className="hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      In Stock Only
                      <button
                        onClick={() => setInStockOnly(false)}
                        className="hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg animate-pulse h-96"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product}
                      viewMode={viewMode}
                      addedItems={addedItems}
                      setAddedItems={setAddedItems}
                      addToCart={addToCart}
                      formatPrice={formatPrice}
                    />
                  ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            page === pageNum
                              ? 'text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                          style={page === pageNum ? { backgroundColor: 'rgb(237, 130, 79)' } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
