'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategories } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  image?: string;
  slug?: string;
  isActive?: boolean;
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [categories]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories((response.data || []).filter((c: Category) => c.isActive !== false));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="bg-white py-8 sm:py-10">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px]">
                <div className="aspect-square bg-gray-100 animate-pulse rounded-lg mb-3" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Popular Categories</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-25 text-gray-400 hover:border-[rgb(22,176,238)] hover:text-[rgb(22,176,238)] transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center disabled:opacity-25 text-gray-400 hover:border-[rgb(22,176,238)] hover:text-[rgb(22,176,238)] transition-all"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-[0.3rem] overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/product-category/${category.slug || category._id}`}
              className="flex-shrink-0 w-[155px] sm:w-[170px] md:w-[185px] lg:w-[200px] group"
            >
              {/* Image box */}
              <div className="aspect-square overflow-hidden bg-gray-50 rounded-[5px] border border-gray-100 group-hover:border-[rgb(22,176,238)]/40 group-hover:shadow-md transition-all duration-300">
                {category.image ? (
                  <>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const fb = e.currentTarget.parentElement?.querySelector('.cat-fb') as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                    <div className="cat-fb hidden w-full h-full items-center justify-center">
                      <span className="text-4xl font-extrabold text-gray-200 select-none">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-gray-200 select-none">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <p className="mt-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-800 group-hover:text-[rgb(22,176,238)] transition-colors text-center leading-tight line-clamp-2 px-1">
                {category.name}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
