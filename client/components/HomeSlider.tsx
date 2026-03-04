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
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden bg-gray-950">
        <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Welcome to Tobo Digital</h2>
          <p className="text-lg md:text-xl mb-8 text-gray-300">Discover amazing products</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-semibold text-xs uppercase tracking-[0.25em] hover:bg-gray-100 transition-colors"
          >
            <span>Shop Now</span>
          </Link>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-[72vh] w-full overflow-hidden bg-gray-950">
      {/* Backgrounds */}
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 flex flex-col justify-center">
        <div className="max-w-2xl">
          {currentBanner.subtitle && (
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white"
                  style={{ color: currentBanner.subtitleColor || '#ffffff' }}
                >
                  {currentBanner.subtitle}
                </span>
              </div>
            </div>
          )}

          {currentBanner.title && (
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-6"
              style={{ color: currentBanner.titleColor || '#ffffff' }}
            >
              {currentBanner.title}
            </h1>
          )}

          {currentBanner.description && (
            <p
              className="text-base md:text-lg text-gray-300 font-medium mb-10 max-w-lg leading-relaxed"
              style={{ color: currentBanner.descriptionColor || '#d1d5db' }}
            >
              {currentBanner.description}
            </p>
          )}

          {currentBanner.buttonText && (
            <div className="flex items-center space-x-6">
              <Link
                href={currentBanner.buttonLink || '/shop'}
                className="group relative inline-flex items-center space-x-4 bg-white text-black px-10 py-4 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-14"
                style={{
                  backgroundColor: currentBanner.buttonBgColor || '#ffffff',
                  color: currentBanner.buttonTextColor || '#000000',
                }}
              >
                <span>{currentBanner.buttonText}</span>
                <ChevronRight className="h-4 w-4 transition-all group-hover:translate-x-2" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 right-6 md:right-12 flex items-center space-x-4 z-20">
          <button
            onClick={prevSlide}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Progress Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-6 md:left-12 flex space-x-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                currentSlide === index ? 'w-10 bg-[#ff006e]' : 'w-4 bg-white/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
