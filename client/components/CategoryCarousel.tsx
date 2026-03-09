'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    };

    checkScrollability();
    container.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [categories]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      const activeCategories = (response.data || []).filter((cat: Category) => cat.isActive !== false);
      setCategories(activeCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 150;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 2;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-10 sm:py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Popular Categories</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center disabled:opacity-30 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center disabled:opacity-30 text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Next categories"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/product-category/${category.slug || category._id}`}
                className="flex-shrink-0 w-[120px] sm:w-[135px] md:w-[150px] lg:w-[160px] group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center mb-2.5 group-hover:border-gray-200 group-hover:shadow-md transition-all duration-300">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${category.image ? 'hidden placeholder' : ''}`}>
                      <span className="text-2xl font-bold text-gray-300">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-gray-700 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
