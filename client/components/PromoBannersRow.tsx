'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPromoRowBanners } from '@/lib/api';

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
  type?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
}

export default function PromoBannersRow() {
  const [banner1, setBanner1] = useState<Banner | null>(null);
  const [banner2, setBanner2] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await getPromoRowBanners();
      const promoBanners = (response.data || [])
        .map((banner: Banner) => {
          // Ensure image URL is absolute if it exists
          if (banner.image && !banner.image.startsWith('http')) {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
            banner.image = `${apiBaseUrl}${banner.image.startsWith('/') ? '' : '/'}${banner.image}`;
          }
          return banner;
        })
        .sort((a: Banner, b: Banner) => a.order - b.order);
      
      // Set first two banners
      if (promoBanners.length > 0) {
        setBanner1(promoBanners[0]);
      }
      if (promoBanners.length > 1) {
        setBanner2(promoBanners[1]);
      } else if (promoBanners.length > 0) {
        setBanner2(promoBanners[0]); // If only one, use it for both for now
      }
    } catch (error) {
      console.error('Error loading promo banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const SingleBanner = ({ banner, fallbackTitle, fallbackSubtitle }: { banner: Banner | null; fallbackTitle: string; fallbackSubtitle: string }) => {
    if (banner) {
      return (
        <Link 
          href={banner.buttonLink || '/shop'} 
          className="block w-full h-full"
        >
          <div 
            className="relative w-full h-64 md:h-80 lg:h-[450px] overflow-hidden group"
            style={{
              backgroundImage: banner.image ? `url(${banner.image})` : 'linear-gradient(to right, #ff006e, #16b0ee)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
            <div className="relative z-10 h-full flex items-end justify-start">
              <div className="text-left px-6 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10">
                {banner.subtitle && (
                  <p 
                    className="text-sm md:text-base lg:text-lg mb-2 font-semibold uppercase tracking-wider"
                    style={{ color: banner.subtitleColor || '#ffffff' }}
                  >
                    {banner.subtitle}
                  </p>
                )}
                {banner.title && (
                  <h3 
                    className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3"
                    style={{ color: banner.titleColor || '#ffffff' }}
                  >
                    {banner.title}
                  </h3>
                )}
                {banner.description && (
                  <p 
                    className="text-base md:text-lg mb-4"
                    style={{ color: banner.descriptionColor || '#ffffff' }}
                  >
                    {banner.description}
                  </p>
                )}
                {banner.buttonText && (
                  <button 
                    className="px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-base md:text-lg"
                    style={{ 
                      backgroundColor: banner.buttonBgColor || '#ffffff',
                      color: banner.buttonTextColor || '#ff006e'
                    }}
                  >
                    {banner.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Fallback banner
    return (
      <Link href="/shop" className="block w-full h-full">
        <div className="relative w-full h-64 md:h-80 lg:h-[450px] bg-gradient-to-r from-[#ff006e] to-[#16b0ee] overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{fallbackTitle}</h3>
              <p className="text-lg md:text-xl lg:text-2xl mb-4">{fallbackSubtitle}</p>
              <button className="bg-white text-[#ff006e] px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base md:text-lg">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <section className="w-full bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="w-full h-64 md:h-80 lg:h-[450px] bg-gray-200 animate-pulse"></div>
          <div className="w-full h-64 md:h-80 lg:h-[450px] bg-gray-200 animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Promo Banner */}
          <div className="w-full">
            <SingleBanner 
              banner={banner1} 
              fallbackTitle="Special Offers" 
              fallbackSubtitle="Up to 50% Off on Selected Items" 
            />
          </div>
          {/* Second Promo Banner */}
          <div className="w-full">
            <SingleBanner 
              banner={banner2} 
              fallbackTitle="Limited Time Offer" 
              fallbackSubtitle="Get Amazing Deals on Premium Products" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

