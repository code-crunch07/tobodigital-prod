'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Review {
  _id: string;
  productName: string;
  productImage?: string;
  rating: number;
  reviewText: string;
  name: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PLACEHOLDER_REVIEWS: Review[] = [
  {
    _id: '1',
    productName: 'Tobo USB C Hub',
    rating: 5,
    reviewText: 'Excellent product! Works perfectly with my laptop. Fast delivery and well-packed. Highly recommend to everyone.',
    name: 'Rajesh Kumar',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    productName: 'Tobo HDMI Cable',
    rating: 5,
    reviewText: 'Great quality cable. The picture is crystal clear on my 4K TV. Very happy with the purchase.',
    name: 'Priya Sharma',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    productName: 'Tobo Type-C Adapter',
    rating: 4,
    reviewText: 'Good product for the price. Compact design and works as expected. Delivery was also quick.',
    name: 'Amit Patel',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '4',
    productName: 'Tobo 240W Charger',
    rating: 5,
    reviewText: 'Super fast charging! My laptop charges from 0 to 100 in under an hour. Build quality feels premium.',
    name: 'Sneha Reddy',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '5',
    productName: 'Tobo USB Hub 7-Port',
    rating: 5,
    reviewText: 'All 7 ports work flawlessly. The USB 3.0 speeds are impressive. No heating issues at all.',
    name: 'Vikram Singh',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6',
    productName: 'Tobo HDMI Matrix Switch',
    rating: 4,
    reviewText: 'Works great with my multi-monitor setup. Easy to configure and very reliable. Solid value for money.',
    name: 'Meera Iyer',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '7',
    productName: 'Tobo Micro HDMI Adapter',
    rating: 5,
    reviewText: 'Perfect fit for my camera. Video quality is pristine on the TV. Small but very well built.',
    name: 'Arjun Nair',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '8',
    productName: 'Tobo USB-C to USB 3.0',
    rating: 5,
    reviewText: 'Fast transfer speeds, sturdy connector, good cable length. Exactly what I needed for file transfers.',
    name: 'Deepika Menon',
    createdAt: new Date().toISOString(),
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const CARDS_PER_SLIDE = 4;

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/public/reviews?limit=20`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data);
        } else {
          setReviews(PLACEHOLDER_REVIEWS);
        }
      } catch {
        setReviews(PLACEHOLDER_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Group into slides of CARDS_PER_SLIDE
  const slides: Review[][] = [];
  for (let i = 0; i < reviews.length; i += CARDS_PER_SLIDE) {
    slides.push(reviews.slice(i, i + CARDS_PER_SLIDE));
  }
  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(totalSlides, 1));
  }, [totalSlides]);

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + Math.max(totalSlides, 1)) % Math.max(totalSlides, 1));
  };

  // Auto-slide every 4 s
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    timerRef.current = setInterval(goNext, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [totalSlides, isPaused, goNext]);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">

        {/* Section header — same style as ProductCarousel */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[rgb(22,176,238)] mb-1">
              Testimonials
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              What Our Customers Say
            </h2>
          </div>

          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[rgb(22,176,238)] hover:text-[rgb(22,176,238)] transition-all shadow-sm"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[rgb(22,176,238)] hover:text-[rgb(22,176,238)] transition-all shadow-sm"
                aria-label="Next reviews"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Slider */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((group, slideIdx) => (
              <div
                key={slideIdx}
                className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[0.3rem]"
              >
                {group.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-[rgb(22,176,238)]'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="relative bg-white border border-gray-100 rounded-[5px] p-4 sm:p-5 flex flex-col gap-3 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Large quote mark */}
      <div className="absolute top-4 right-4 opacity-10 text-[rgb(22,176,238)]">
        <Quote className="h-7 w-7 fill-current" />
      </div>

      {/* Stars */}
      <StarRow rating={review.rating} />

      {/* Review text */}
      <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-4 flex-1">
        "{review.reviewText}"
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Avatar + name + product + badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[rgb(22,176,238)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-bold leading-none">{getInitials(review.name)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{review.name}</p>
          <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">on {review.productName}</p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          Verified
        </span>
      </div>
    </div>
  );
}
