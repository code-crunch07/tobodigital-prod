'use client';

import { X, ShoppingCart, Minus, Plus, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  _id: string;
  itemName: string;
  mainImage: string;
  yourPrice: number;
  quantity: number;
  color?: string;
}

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartPanel({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartPanelProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.yourPrice * item.quantity, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop only below header - header stays clear, no grey on nav */}
      {isOpen && (
        <div
          className="fixed top-14 left-0 right-0 bottom-0 z-[100] bg-black/20 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Cart dropdown - small gap below header, then panel */}
      <div
        className={`fixed top-16 right-4 z-[101] w-full max-w-md max-h-[calc(100vh-4.5rem)] flex flex-col bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cart"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-lg font-bold text-gray-900">Cart</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items - scroll when many products */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm mb-6">Add some products to get started</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: 'rgb(22, 176, 238)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(18, 150, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 176, 238)'}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="relative flex gap-3 p-3 border-b border-gray-200">
                  {/* Product Image */}
                  <img
                    src={item.mainImage || '/placeholder-product.jpg'}
                    alt={item.itemName}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                      {item.itemName}
                    </h3>
                    {item.color && (
                      <p className="text-xs text-gray-600 mb-1">
                        Color: <span className="text-blue-500">{item.color}</span>
                      </p>
                    )}
                    <p className="text-sm font-semibold text-blue-600 mb-3">
                      {formatPrice(item.yourPrice)}
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-medium w-10 text-center border-x border-gray-300">
                          {String(item.quantity).padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Icons - Top Right */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onRemoveItem(item._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Subtotal (X items) and buttons */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="space-y-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="block w-full border border-gray-800 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
