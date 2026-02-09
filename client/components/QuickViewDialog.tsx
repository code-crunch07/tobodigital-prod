'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Star, Heart, Check, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';
import { getProductUrl } from '@/lib/product-url';

interface QuickViewDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (price: number) => string;
}

export default function QuickViewDialog({
  product,
  isOpen,
  onClose,
  formatPrice,
}: QuickViewDialogProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const discount =
    product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice
      ? Math.round(
          ((product.maximumRetailPrice - product.yourPrice) / product.maximumRetailPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      itemName: product.itemName,
      mainImage: product.mainImage,
      yourPrice: product.yourPrice,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isWishlisted = isInWishlist(product._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.itemName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {discount > 0 ? (
              <span
                className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#ff006e] text-white text-xs font-semibold pl-2 pr-3 py-1.5 shadow-md"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
              >
                <Tag className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{discount}% off</span>
              </span>
            ) : null}
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{product.brandName}</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{product.itemName}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(2 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold" style={{ color: 'rgb(237, 130, 79)' }}>
                  {formatPrice(product.yourPrice)}
                </span>
                {product.maximumRetailPrice && product.maximumRetailPrice > product.yourPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.maximumRetailPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stockQuantity !== undefined && product.stockQuantity > 0 ? (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || addedToCart}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                  product.stockQuantity === 0 || addedToCart
                    ? 'bg-gray-300 cursor-not-allowed'
                    : ''
                }`}
                style={
                  product.stockQuantity !== 0 && !addedToCart
                    ? { backgroundColor: 'rgb(22, 176, 238)' }
                    : {}
                }
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

              <div className="flex gap-3">
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                <Link
                  href={getProductUrl(product)}
                  className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

