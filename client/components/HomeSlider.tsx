'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBanners } from '@/lib/api';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
}

export default function HomeSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000); // Auto-slide every 5 seconds
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const response = await getBanners('slider'); // Fetch only slider banners
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] md:h-[600px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading slider...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[500px] md:h-[600px] bg-gradient-to-r from-[#ff006e] to-[#00d4ff] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Tobo Digital</h2>
          <p className="text-xl mb-6">Discover amazing products</p>
          <Link
            href="/shop"
            className="bg-white text-[#ff006e] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="min-w-full h-full relative flex items-center"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                {banner.subtitle && (
                  <p 
                    className="text-sm md:text-base mb-2 font-semibold uppercase tracking-wider"
                    style={{ color: banner.subtitleColor || '#ffffff' }}
                  >
                    {banner.subtitle}
                  </p>
                )}
                {banner.title && (
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                    style={{ color: banner.titleColor || '#ffffff' }}
                  >
                    {banner.title}
                  </h1>
                )}
                {banner.description && (
                  <p 
                    className="text-lg md:text-xl mb-8"
                    style={{ color: banner.descriptionColor || '#ffffff' }}
                  >
                    {banner.description}
                  </p>
                )}
                {banner.buttonText && (
                  <Link
                    href={banner.buttonLink || '/shop'}
                    className="inline-block px-8 py-3 md:px-10 md:py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:opacity-90"
                    style={{ 
                      backgroundColor: banner.buttonBgColor || '#ff006e',
                      color: banner.buttonTextColor || '#ffffff'
                    }}
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-[#ff006e] w-8'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
