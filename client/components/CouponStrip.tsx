'use client';

import { useEffect, useState } from 'react';
import { Tag, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  endDate: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = coupon.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  const expiry = new Date(coupon.endDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-0 rounded-lg border border-dashed border-[rgb(22,176,238)]/50 overflow-hidden bg-[rgb(22,176,238)]/3 min-w-0">
      {/* Left badge */}
      <div className="flex-shrink-0 bg-[rgb(22,176,238)] text-white px-3 py-3 flex flex-col items-center justify-center min-w-[68px]">
        <Tag className="h-3.5 w-3.5 mb-0.5" />
        <span className="text-[11px] font-extrabold leading-tight text-center">{label}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[13px] font-bold text-gray-900 tracking-wider bg-white border border-gray-200 rounded px-2 py-0.5">
            {coupon.code}
          </span>
          <button
            type="button"
            onClick={copy}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded transition-all ${
              copied
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-[rgb(22,176,238)]/10 text-[rgb(22,176,238)] hover:bg-[rgb(22,176,238)]/20'
            }`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {coupon.description && (
          <p className="text-[11px] text-gray-500 mt-1 truncate">{coupon.description}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {coupon.minPurchaseAmount && (
            <span className="text-[10px] text-gray-400">
              Min. ₹{coupon.minPurchaseAmount}
            </span>
          )}
          {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
            <span className="text-[10px] text-gray-400">
              Up to ₹{coupon.maxDiscountAmount} off
            </span>
          )}
          <span className="text-[10px] text-gray-400">Valid till {expiry}</span>
        </div>
      </div>
    </div>
  );
}

export default function CouponStrip() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/coupons/public/active`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCoupons(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || coupons.length === 0) return null;

  const visible = expanded ? coupons : coupons.slice(0, 2);

  return (
    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[rgb(22,176,238)]" />
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
            Available Coupons
          </span>
          <span className="text-[10px] bg-[rgb(22,176,238)] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
            {coupons.length}
          </span>
        </div>
        {coupons.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[rgb(22,176,238)] hover:opacity-80 transition-opacity"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> +{coupons.length - 2} more</>
            )}
          </button>
        )}
      </div>

      {/* Coupon list */}
      <div className="p-3 space-y-2.5 bg-white">
        {visible.map((c) => (
          <CouponCard key={c._id} coupon={c} />
        ))}
      </div>
    </div>
  );
}
