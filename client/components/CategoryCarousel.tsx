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
      // Filter only active categories and ensure image URLs are properly formatted
      const activeCategories = (response.data || []).filter((cat: Category) => cat.isActive !== false).map((cat: Category) => {
        // Ensure image URL is absolute if it exists
        if (cat.image && !cat.image.startsWith('http')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
          cat.image = `${apiBaseUrl}${cat.image.startsWith('/') ? '' : '/'}${cat.image}`;
        }
        return cat;
      });
      
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

    const cardWidth = 180; // lg:w-[180px]
    const gap = 24; // lg:gap-6 = 24px
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-[1920px] mx-auto pl-6 sm:pl-8 lg:pl-12 xl:pl-16 pr-0">
        {/* Title + Navigation Arrows */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Popular Categories</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex items-center justify-center disabled:text-gray-300 text-gray-800 hover:text-gray-900 transition-colors"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex items-center justify-center disabled:text-gray-300 text-gray-900 hover:text-black transition-colors"
              aria-label="Next categories"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
        
        {/* Horizontal Scrollable Carousel */}
        <div className="relative">
          {/* Categories Container - Scrollable */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 pb-4 overflow-x-auto scrollbar-hide scroll-smooth pr-20"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/product-category/${category.slug || category._id}`}
                className="flex-shrink-0 w-[140px] md:w-[160px] lg:w-[180px] group last:mr-0"
              >
                <div className="bg-white overflow-hidden">
                  {/* Category Image */}
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden relative mb-3 flex items-center justify-center">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${category.image ? 'hidden placeholder' : ''}`}>
                      <span className="text-3xl font-bold text-gray-400">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {/* Category Name */}
                  <div className="text-center">
                    <span className="text-[14px] font-semibold text-gray-900 block">
                      {category.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
    </section>
  );
}