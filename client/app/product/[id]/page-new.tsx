'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, MapPin, Truck, Shield, RefreshCw, Check, X, ChevronRight, Minus, Plus, Package, Zap } from 'lucide-react';
import { getProductById, getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  galleryImages?: string[];
  productId?: string;
  modelNo?: string;
  productDescription?: string;
  bulletPoints?: string[] | string;
  specialFeatures?: string;
  yourPrice: number;
  maxRetailPrice?: number;
  maximumRetailPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  itemDimensions?: { length?: number; width?: number; height?: number; unit?: string };
  itemWeight?: number;
  packageDimensions?: { length?: number; width?: number; height?: number; unit?: string };
  packageWeight?: number;
  hsnCode?: string;
  countryOfOrigin?: string;
  warrantyDescription?: string;
  compatibleDevices?: string[] | string;
  includedComponents?: string[] | string;
  productCategory?: { name: string; _id: string; slug?: string };
  subCategory?: { name: string; _id: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ type: 'success' | 'error'; message: string; details?: any } | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

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
      loadSimilarProducts(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarProducts = async (currentProduct: Product) => {
    try {
      const categoryId = currentProduct.productCategory?._id;
      if (!categoryId) return;

      const response = await getProducts({ limit: 8, category: categoryId });
      const products = response.data?.products || [];
      const filtered = products.filter((p: Product) => p._id !== currentProduct._id);
      setSimilarProducts(filtered.slice(0, 8));
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

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
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/checkout'), 300);
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeResult({ type: 'error', message: 'Please enter a valid 6-digit pincode' });
      return;
    }

    // Mock pincode check
    const serviceablePincodes: Record<string, any> = {
      '400001': { city: 'Mumbai', state: 'Maharashtra', days: '2-3' },
      '110001': { city: 'Delhi', state: 'Delhi', days: '3-4' },
      '560001': { city: 'Bangalore', state: 'Karnataka', days: '3-4' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu', days: '4-5' },
    };

    const areaCode = pincode.substring(0, 3);
    const serviceableAreas = ['400', '401', '110', '560', '600', '700'];

    if (serviceablePincodes[pincode]) {
      const info = serviceablePincodes[pincode];
      setPincodeResult({
        type: 'success',
        message: 'Delivery Available!',
        details: info,
      });
    } else if (serviceableAreas.includes(areaCode)) {
      setPincodeResult({
        type: 'success',
        message: 'Delivery Available!',
        details: { days: '3-5' },
      });
    } else {
      setPincodeResult({
        type: 'error',
        message: `Delivery not available to pincode ${pincode}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1A1A1A] rounded w-32 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-[#1A1A1A] rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-[#1A1A1A] rounded w-3/4"></div>
                <div className="h-6 bg-[#1A1A1A] rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/shop" className="text-[#FF6B35] hover:text-[#FF8A50]">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.galleryImages && product.galleryImages.length > 0
    ? [product.mainImage, ...product.galleryImages]
    : [product.mainImage];

  const mrp = product.maximumRetailPrice || product.maxRetailPrice || 0;
  const currentPrice = product.salePrice && product.salePrice < product.yourPrice 
    ? product.salePrice 
    : product.yourPrice;
  const discount = mrp && mrp > currentPrice
    ? Math.round(((mrp - currentPrice) / mrp) * 100)
    : 0;
  const savings = mrp - currentPrice;

  const bulletPointsArray = Array.isArray(product.bulletPoints)
    ? product.bulletPoints
    : typeof product.bulletPoints === 'string'
    ? product.bulletPoints.split(',').map(b => b.trim())
    : [];

  const compatibleDevicesArray = Array.isArray(product.compatibleDevices)
    ? product.compatibleDevices
    : typeof product.compatibleDevices === 'string'
    ? product.compatibleDevices.split(',').map(d => d.trim())
    : [];

  const includedComponentsArray = Array.isArray(product.includedComponents)
    ? product.includedComponents
    : typeof product.includedComponents === 'string'
    ? product.includedComponents.split(',').map(c => c.trim())
    : [];

  const isInStock = product.stockQuantity !== undefined && product.stockQuantity > 0;
  const isWishlisted = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#888888] mb-8">
          <Link href="/" className="hover:text-[#FF6B35] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-[#FF6B35] transition-colors">Shop</Link>
          {product.productCategory && (
            <>
              <span>›</span>
              <Link
                href={`/product-category/${product.productCategory.slug || product.productCategory._id}`}
                className="hover:text-[#FF6B35] transition-colors"
              >
                {product.productCategory.name}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-[#CCCCCC]">{product.itemName}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 aspect-[4/3] flex items-center justify-center overflow-hidden">
              {discount > 0 && (
                <span className="absolute top-6 right-6 bg-gradient-to-r from-[#FF6B35] to-[#FF8A50] px-4 py-2 rounded-full text-sm font-semibold z-10 animate-pulse">
                  -{discount}%
                </span>
              )}
              <img
                src={selectedImage || product.mainImage}
                alt={product.itemName}
                className="max-w-[85%] max-h-[85%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square bg-[#1A1A1A] border-2 rounded-xl p-4 flex items-center justify-center transition-all ${
                      selectedImage === img
                        ? 'border-[#FF6B35] bg-[#242424] -translate-y-1'
                        : 'border-[#2A2A2A] hover:border-[#FF6B35]'
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-[70%] h-[70%] object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {isInStock && (
              <span className="inline-block bg-[#00C853] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide">
                ✓ In Stock
              </span>
            )}
            
            <h1 className="font-bold text-4xl leading-tight">{product.itemName}</h1>
            
            <p className="text-[#888888] text-sm">
              Model: {product.modelNo || product.productId || 'N/A'} | SKU: {product._id.slice(-8).toUpperCase()}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#2A2A2A]">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#FFC107] text-[#FFC107]" />
                ))}
              </div>
              <span className="text-[#CCCCCC]">4.8 out of 5</span>
              <span className="text-[#888888]">(2,847 verified reviews)</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-[rgba(255,107,53,0.1)] to-[rgba(0,180,204,0.1)] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-bold text-[#FF6B35]">{formatPrice(currentPrice)}</span>
                {mrp > currentPrice && (
                  <>
                    <span className="text-2xl text-[#888888] line-through">{formatPrice(mrp)}</span>
                    <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-md font-bold text-lg">-{discount}%</span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-[#00C853] font-semibold mb-2">You save: {formatPrice(savings)} ({discount}% off)</p>
              )}
              <p className="text-[#888888] text-sm">Inclusive of all taxes | Free Shipping on orders above ₹499</p>
            </div>

            {/* Description */}
            {product.productDescription && (
              <p className="text-[#CCCCCC] leading-relaxed text-lg">
                {product.productDescription.substring(0, 200)}...
              </p>
            )}

            {/* Key Features */}
            {bulletPointsArray.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {bulletPointsArray.slice(0, 4).map((point, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 flex items-start gap-3 hover:border-[#FF6B35] hover:translate-x-1 transition-all"
                  >
                    <span className="text-2xl flex-shrink-0">🎬</span>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{point}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-[#CCCCCC]">Quantity:</label>
                <div className="inline-flex bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 text-xl hover:bg-[#FF6B35] transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center border-x border-[#2A2A2A]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-5 py-3 text-xl hover:bg-[#FF6B35] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8A50] text-white py-4 px-8 rounded-lg font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] py-4 px-8 rounded-lg font-bold text-lg hover:bg-[#FF6B35] hover:text-white transition-all"
                >
                  <Zap className="h-5 w-5 inline mr-2" />
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="bg-[#0F0F0F] border border-[#2A2A2A] p-4 rounded-lg text-2xl hover:border-[#E91E63] hover:text-[#E91E63] hover:scale-110 transition-all"
                >
                  <Heart className={isWishlisted ? 'fill-[#E91E63] text-[#E91E63]' : ''} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5 text-center hover:border-[#00B4CC] hover:-translate-y-1 transition-all">
                <Truck className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">Free Delivery</div>
                <div className="text-xs text-[#888888]">On orders above ₹499</div>
              </div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5 text-center hover:border-[#00B4CC] hover:-translate-y-1 transition-all">
                <RefreshCw className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">Easy Returns</div>
                <div className="text-xs text-[#888888]">30-day return policy</div>
              </div>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5 text-center hover:border-[#00B4CC] hover:-translate-y-1 transition-all">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">1 Year Warranty</div>
                <div className="text-xs text-[#888888]">Manufacturer warranty</div>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">📍 Check Delivery & Serviceability</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && checkPincode()}
                  placeholder="Enter your pincode"
                  maxLength={6}
                  className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#888888] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
                />
                <button
                  onClick={checkPincode}
                  className="bg-gradient-to-r from-[#00B4CC] to-[#00D4CC] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Check
                </button>
              </div>
              {pincodeResult && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    pincodeResult.type === 'success'
                      ? 'bg-[rgba(0,200,83,0.15)] border border-[#00C853] text-[#00C853]'
                      : 'bg-[rgba(255,107,53,0.15)] border border-[#FF6B35] text-[#FF6B35]'
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {pincodeResult.type === 'success' ? '✅' : '❌'} {pincodeResult.message}
                  </div>
                  {pincodeResult.details && (
                    <div className="text-sm space-y-1 mt-2">
                      {pincodeResult.details.city && (
                        <div><strong>📍 Location:</strong> {pincodeResult.details.city}, {pincodeResult.details.state}</div>
                      )}
                      <div><strong>📦 Delivery:</strong> {pincodeResult.details.days} business days</div>
                      <div><strong>💰 Shipping:</strong> <span className="text-[#00C853] font-semibold">FREE</span></div>
                      <div><strong>💳 Cash on Delivery:</strong> <span className="text-[#00C853]">Available ✓</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {(product.itemDimensions || product.itemWeight || product.hsnCode) && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-[#FF6B35]">📋 Technical Specifications</h2>
            <div className="space-y-4">
              {product.itemDimensions && (
                <div className="grid grid-cols-[1fr_1.5fr] gap-4 p-4 border-b border-[#2A2A2A] hover:bg-[rgba(255,107,53,0.05)]">
                  <div className="font-semibold text-[#CCCCCC]">Dimensions</div>
                  <div>{product.itemDimensions.length} × {product.itemDimensions.width} × {product.itemDimensions.height} {product.itemDimensions.unit || 'cm'}</div>
                </div>
              )}
              {product.itemWeight && (
                <div className="grid grid-cols-[1fr_1.5fr] gap-4 p-4 border-b border-[#2A2A2A] hover:bg-[rgba(255,107,53,0.05)]">
                  <div className="font-semibold text-[#CCCCCC]">Weight</div>
                  <div>{product.itemWeight} grams</div>
                </div>
              )}
              {product.hsnCode && (
                <div className="grid grid-cols-[1fr_1.5fr] gap-4 p-4 border-b border-[#2A2A2A] hover:bg-[rgba(255,107,53,0.05)]">
                  <div className="font-semibold text-[#CCCCCC]">HSN Code</div>
                  <div>{product.hsnCode}</div>
                </div>
              )}
              {product.countryOfOrigin && (
                <div className="grid grid-cols-[1fr_1.5fr] gap-4 p-4 hover:bg-[rgba(255,107,53,0.05)]">
                  <div className="font-semibold text-[#CCCCCC]">Country of Origin</div>
                  <div>{product.countryOfOrigin}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <div className="mb-12">
          <div className="flex gap-0 border-b-2 border-[#2A2A2A] mb-8">
            {['Description', 'Compatibility', 'What\'s in the Box', 'Setup Guide'].map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-8 py-4 font-semibold transition-all border-b-3 ${
                  activeTab === index
                    ? 'text-[#FF6B35] border-b-[#FF6B35]'
                    : 'text-[#888888] border-b-transparent hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
            {activeTab === 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF6B35]">Product Overview</h3>
                {product.productDescription && (
                  <div
                    className="prose prose-invert max-w-none prose-img:max-w-full prose-img:h-auto mb-4"
                    dangerouslySetInnerHTML={{ __html: product.productDescription }}
                  />
                )}
                {!product.productDescription && (
                  <p className="text-[#CCCCCC] leading-relaxed mb-4">No description available.</p>
                )}
                {bulletPointsArray.length > 0 && (
                  <ul className="list-disc list-inside text-[#CCCCCC] space-y-2 ml-4">
                    {bulletPointsArray.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF6B35]">Device Compatibility</h3>
                {compatibleDevicesArray.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {compatibleDevicesArray.map((device, i) => (
                      <div key={i} className="bg-[#0F0F0F] p-4 rounded-lg border border-[#2A2A2A] text-center">
                        <strong>✓ {device}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#CCCCCC]">Compatibility information not available.</p>
                )}
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF6B35]">Package Contents</h3>
                {includedComponentsArray.length > 0 ? (
                  <ul className="space-y-3">
                    {includedComponentsArray.map((component, i) => (
                      <li key={i} className="flex justify-between items-center p-3 border-b border-[#2A2A2A]">
                        <span className="text-[#CCCCCC]">✓ {component}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#CCCCCC]">Package contents information not available.</p>
                )}
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF6B35]">Quick Setup Guide</h3>
                <div className="space-y-4 text-[#CCCCCC]">
                  <div className="p-4 bg-[#0F0F0F] rounded-lg border-l-4 border-[#FF6B35]">
                    <strong className="text-[#FF6B35]">Step 1: Connect Input</strong><br />
                    Connect your HDMI source device to the HDMI IN port.
                  </div>
                  <div className="p-4 bg-[#0F0F0F] rounded-lg border-l-4 border-[#00B4CC]">
                    <strong className="text-[#00B4CC]">Step 2: Connect Output</strong><br />
                    Connect your display to the HDMI OUT port.
                  </div>
                  <div className="p-4 bg-[#0F0F0F] rounded-lg border-l-4 border-[#FFC107]">
                    <strong className="text-[#FFC107]">Step 3: Connect Audio</strong><br />
                    Connect your audio device using the available audio outputs.
                  </div>
                  <div className="p-4 bg-[#0F0F0F] rounded-lg border-l-4 border-[#00C853]">
                    <strong className="text-[#00C853]">Step 4: Power On</strong><br />
                    Connect the power cable and turn on the device.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 relative">
              You May Also Like
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#FF6B35] to-[#00B4CC] mt-2"></div>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((item) => {
                const itemMrp = item.maximumRetailPrice || item.maxRetailPrice || 0;
                const itemPrice = item.salePrice && item.salePrice < item.yourPrice ? item.salePrice : item.yourPrice;
                const itemDiscount = itemMrp && itemMrp > itemPrice ? Math.round(((itemMrp - itemPrice) / itemMrp) * 100) : 0;

                return (
                  <Link key={item._id} href={`/product/${item._id}`} className="group">
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#FF6B35] hover:-translate-y-2.5 hover:shadow-[0_15px_40px_rgba(255,107,53,0.2)] transition-all">
                      <div className="relative aspect-square bg-[#0F0F0F] p-8 flex items-center justify-center">
                        {itemDiscount > 0 && (
                          <span className="absolute top-2 left-2 bg-[#FF6B35] text-white px-2 py-1 rounded-full text-xs font-semibold">
                            -{itemDiscount}%
                          </span>
                        )}
                        <img
                          src={item.mainImage}
                          alt={item.itemName}
                          className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-[#888888] uppercase mb-1">
                          {item.productCategory?.name || 'Product'}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-white group-hover:text-[#FF6B35] transition-colors">
                          {item.itemName}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" />
                          ))}
                          <span className="text-xs text-[#888888] ml-1">(1,234)</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-[#FF6B35]">{formatPrice(itemPrice)}</span>
                          {itemMrp > itemPrice && (
                            <span className="text-sm text-[#888888] line-through">{formatPrice(itemMrp)}</span>
                          )}
                        </div>
                        <button className="w-full bg-transparent border border-[#2A2A2A] text-[#888888] py-2 rounded-lg font-semibold hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
