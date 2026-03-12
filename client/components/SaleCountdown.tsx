'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface SaleCountdownProps {
  saleEndDate: string | Date;
  variant?: 'card' | 'detail';
}

function getTimeLeft(endDate: Date) {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export default function SaleCountdown({ saleEndDate, variant = 'card' }: SaleCountdownProps) {
  const end = new Date(saleEndDate);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(end));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(end)), 1000);
    return () => clearInterval(timer);
  }, [saleEndDate]);

  if (!timeLeft) return null;

  if (variant === 'detail') {
    return (
      <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs font-medium text-orange-700">
        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" />
        <span>Sale ends in:</span>
        <div className="flex items-center gap-1 font-bold text-orange-600">
          {timeLeft.d > 0 && (
            <span className="bg-orange-100 rounded px-1.5 py-0.5">{timeLeft.d}d</span>
          )}
          <span className="bg-orange-100 rounded px-1.5 py-0.5">{String(timeLeft.h).padStart(2,'0')}h</span>
          <span className="bg-orange-100 rounded px-1.5 py-0.5">{String(timeLeft.m).padStart(2,'0')}m</span>
          <span className="bg-orange-100 rounded px-1.5 py-0.5">{String(timeLeft.s).padStart(2,'0')}s</span>
        </div>
      </div>
    );
  }

  // card variant — compact single line
  return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 mt-1">
      <Clock className="h-3 w-3 flex-shrink-0" />
      <span>
        Sale ends in{' '}
        {timeLeft.d > 0 && `${timeLeft.d}d `}
        {String(timeLeft.h).padStart(2,'0')}h {String(timeLeft.m).padStart(2,'0')}m {String(timeLeft.s).padStart(2,'0')}s
      </span>
    </div>
  );
}
