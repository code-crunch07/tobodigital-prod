'use client';

import HomeSlider from '@/components/HomeSlider';
import CategoryCarousel from '@/components/CategoryCarousel';
import PromotionBanner from '@/components/PromotionBanner';
import ProductCarousel from '@/components/ProductCarousel';
import PromoBannersRow from '@/components/PromoBannersRow';
import SaleProductsSection from '@/components/SaleProductsSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 min-w-0 overflow-x-hidden">
      {/* Full Width Slider */}
      <section className="w-full">
        <HomeSlider />
      </section>

      {/* Categories Section */}
      <CategoryCarousel />

      {/* Promotion Banner Section */}
      <PromotionBanner />

      {/* Product Carousel Section */}
      <ProductCarousel />

      {/* Promo Banners Row - Two Banners Side by Side */}
      <PromoBannersRow />

      {/* New Arrivals - Title, details and product carousel */}
      <ProductCarousel
        title="New Arrivals"
        dataSource="newest"
      />

      {/* Sale Products - 2-column grid with blue border */}
      <SaleProductsSection />

      {/* Top Deals */}
      <ProductCarousel
        title="Top Deals"
        dataSource="deals"
      />

      {/* Customer Reviews & Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
