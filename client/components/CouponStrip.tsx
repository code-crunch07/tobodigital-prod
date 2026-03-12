'use client';

import { useEffect, useState } from 'react';
import { Ticket, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="flex items-stretch rounded-lg overflow-hidden border border-[rgb(22,176,238)]/20 bg-white">
      {/* Left accent — discount label */}
      <div className="relative flex-shrink-0 w-[80px] bg-gradient-to-b from-[rgb(22,176,238)] to-[rgb(10,150,210)] flex flex-col items-center justify-center gap-1 py-4 px-2">
        {/* Notch top */}
        <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-50 rounded-full border border-[rgb(22,176,238)]/20 z-10" />
        <Ticket className="h-4 w-4 text-white/80" />
        <span className="text-white font-extrabold text-[13px] leading-tight text-center">
          {label}
        </span>
      </div>

      {/* Dashed separator */}
      <div className="w-px border-l-2 border-dashed border-[rgb(22,176,238)]/25 self-stretch" />

      {/* Right content */}
      <div className="flex-1 px-3.5 py-3 min-w-0 bg-[rgb(22,176,238)]/[0.03]">
        {/* Code row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[13px] font-bold text-gray-900 tracking-widest bg-white border border-dashed border-[rgb(22,176,238)]/40 rounded-md px-2.5 py-0.5">
            {coupon.code}
          </span>
          <button
            type="button"
            onClick={copy}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                : 'border-[rgb(22,176,238)]/30 bg-white text-[rgb(22,176,238)] hover:bg-[rgb(22,176,238)]/10'
            }`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Description */}
        {coupon.description && (
          <p className="text-[11px] text-gray-600 mt-1.5 font-medium truncate">
            {coupon.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1.5">
          {coupon.minPurchaseAmount && (
            <>
              <span className="text-[10px] text-gray-400">
                Min. order ₹{coupon.minPurchaseAmount}
              </span>
              <span className="text-gray-200 text-[10px]">|</span>
            </>
          )}
          {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
            <>
              <span className="text-[10px] text-gray-400">
                Max. ₹{coupon.maxDiscountAmount} off
              </span>
              <span className="text-gray-200 text-[10px]">|</span>
            </>
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
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 text-[rgb(22,176,238)]" />
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
            className="flex items-center gap-1 text-[11px] font-semibold text-[rgb(22,176,238)] hover:opacity-75 transition-opacity"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" />Show less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" />+{coupons.length - 2} more</>
            )}
          </button>
        )}
      </div>

      {/* Coupon list */}
      <div className="space-y-2.5">
        {visible.map((c) => (
          <CouponCard key={c._id} coupon={c} />
        ))}
      </div>
    </div>
  );
}
