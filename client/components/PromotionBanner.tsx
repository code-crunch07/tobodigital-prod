'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPromotionBanners } from '@/lib/api';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
}

export default function PromotionBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadBanners();
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
  }, [banners]);

  const loadBanners = async () => {
    try {
      const response = await getPromotionBanners();
      // Ensure image URLs are properly formatted
      const activeBanners = (response.data || [])
        .map((banner: Banner) => {
          // Ensure image URL is absolute if it exists
          if (banner.image && !banner.image.startsWith('http')) {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
            banner.image = `${apiBaseUrl}${banner.image.startsWith('/') ? '' : '/'}${banner.image}`;
          }
          return banner;
        })
        .sort((a: Banner, b: Banner) => a.order - b.order);
      
      setBanners(activeBanners);
    } catch (error) {
      console.error('Error loading promotion banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const bannerWidth = container.clientWidth;
    const scrollAmount = bannerWidth;

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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 md:py-12">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Promotion Banners Container - Scrollable */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {banners.map((banner) => (
              <Link
                key={banner._id}
                href={banner.buttonLink || '/shop'}
                className="flex-shrink-0 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] group"
              >
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
                  {/* Full Area Image */}
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title || banner.subtitle || 'Banner'}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        minWidth: '100%',
                        minHeight: '100%'
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-r from-[#ff006e] to-[#16b0ee]">
                      <div className="text-center text-white px-4">
                        {banner.title && (
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>
                        )}
                        {banner.subtitle && (
                          <p className="text-lg md:text-xl">{banner.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 lg:p-10 z-10">
                    <div className="text-left">
                      {banner.subtitle && (
                        <span 
                          className="inline-block text-xs md:text-sm font-semibold mb-2 uppercase tracking-wider drop-shadow-lg"
                          style={{ color: banner.subtitleColor || '#ffffff' }}
                        >
                          {banner.subtitle}
                        </span>
                      )}
                      {banner.title && (
                        <h3 
                          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 drop-shadow-lg"
                          style={{ color: banner.titleColor || '#ffffff' }}
                        >
                          {banner.title}
                        </h3>
                      )}
                      {banner.description && (
                        <p 
                          className="text-sm md:text-base mb-4 drop-shadow-md"
                          style={{ color: banner.descriptionColor || '#ffffff' }}
                        >
                          {banner.description}
                        </p>
                      )}
                      {banner.buttonText && (
                        <span 
                          className="inline-block text-sm md:text-base font-semibold hover:opacity-80 transition-opacity drop-shadow-md px-4 py-2 rounded"
                          style={{ 
                            color: banner.buttonTextColor || '#ffffff',
                            backgroundColor: banner.buttonBgColor || 'transparent'
                          }}
                        >
                          {banner.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Left Navigation Arrow */}
          {banners.length > 3 && canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {banners.length > 3 && canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg"
              aria-label="Next banner"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
    </section>
  );
}

