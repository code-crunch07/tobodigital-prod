'use client';

import Image from 'next/image';

interface InvoiceProps {
  order: any;
}

export default function Invoice({ order }: InvoiceProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div id="invoice" className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(237, 130, 79)' }}>
            TOBO DIGITAL
          </h1>
          <p className="text-gray-600 text-sm">
            E-commerce Store
          </p>
          <p className="text-gray-600 text-sm">
            Email: support@tobo.com
          </p>
          <p className="text-gray-600 text-sm">
            Phone: +91 1234567890
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold mb-4">INVOICE</h2>
          <div className="text-sm">
            <p className="mb-1"><strong>Invoice #:</strong> {order.orderNumber}</p>
            <p className="mb-1"><strong>Date:</strong> {formatDate(order.date)}</p>
            {order.trackingNumber && (
              <p><strong>Tracking #:</strong> {order.trackingNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing & Shipping Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-2">Bill To:</h3>
          <div className="text-sm">
            {(order.companyName || order.gstNumber) && (
              <>
                {order.companyName && <p className="font-semibold">{order.companyName}</p>}
                {order.gstNumber && <p className="text-gray-600">GSTIN: {order.gstNumber}</p>}
              </>
            )}
            {!(order.companyName || order.gstNumber) && (
              <p className="font-semibold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            )}
            {(() => {
              const addr = order.billingAddress || order.shippingAddress;
              return addr ? (
                <>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                </>
              ) : null;
            })()}
            <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
            <p>Email: {order.shippingAddress?.email}</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-2">Ship To:</h3>
          <div className="text-sm">
            <p className="font-semibold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
            <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">SKU</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, index: number) => (
              <tr key={item._id}>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/api/placeholder/150/150'}
                        alt={item.itemName}
                        width={64}
                        height={64}
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/150/150';
                        }}
                      />
                    </div>
                    <span className="font-medium">{item.itemName}</span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                  {item.sku || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">{formatPrice(item.yourPrice)}</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                  {formatPrice(item.yourPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="border border-gray-300">
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.shipping > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold">{formatPrice(order.shipping)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">{formatPrice(order.tax)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300 text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3 bg-gray-100 font-bold text-lg">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-300">
        <h3 className="font-bold text-lg mb-3">Payment Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> <span className="text-green-600">{order.paymentStatus.toUpperCase()}</span></p>
          </div>
          {order.trackingNumber && (
            <div>
              <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
              {order.estimatedDelivery && (
                <p><strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-center text-sm text-gray-600">
        <p className="mb-2">Thank you for your business!</p>
        <p>For any queries, please contact us at support@tobo.com or +91 1234567890</p>
        <p className="mt-4">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
}

