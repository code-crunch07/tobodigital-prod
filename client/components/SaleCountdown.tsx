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
    const timer = setInterval(() => setTimeLeft(getTimeLeft(new Date(saleEndDate))), 1000);
    return () => clearInterval(timer);
  }, [saleEndDate]);

  if (!timeLeft) return null;

  const { d, h, m, s } = timeLeft;

  if (variant === 'detail') {
    return (
      <div className="flex items-center gap-2.5 bg-[rgb(22,176,238)]/8 border border-[rgb(22,176,238)]/25 rounded-lg px-3.5 py-2.5">
        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-[rgb(22,176,238)]" />
        <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">Sale ends in</span>
        <div className="flex items-center gap-1">
          {d > 0 && (
            <TimeBlock value={d} label="d" />
          )}
          <TimeBlock value={h} label="h" />
          <span className="text-[rgb(22,176,238)] font-bold text-xs pb-2">:</span>
          <TimeBlock value={m} label="m" />
          <span className="text-[rgb(22,176,238)] font-bold text-xs pb-2">:</span>
          <TimeBlock value={s} label="s" />
        </div>
      </div>
    );
  }

  // card variant — compact badge
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${String(h).padStart(2, '0')}h`);
  parts.push(`${String(m).padStart(2, '0')}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <Clock className="h-2.5 w-2.5 flex-shrink-0 text-[rgb(22,176,238)]" />
      <span className="text-[9.5px] font-semibold text-[rgb(22,176,238)] leading-none">
        {parts.join(' ')}
      </span>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[30px] bg-white rounded border border-[rgb(22,176,238)]/20 px-1.5 py-1 shadow-sm">
      <span className="text-[13px] font-bold text-[rgb(22,176,238)] leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[8px] uppercase text-gray-400 font-medium tracking-wider mt-0.5">{label}</span>
    </div>
  );
}
