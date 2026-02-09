'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Truck, 
  Headphones, 
  CreditCard, 
  Package,
  Facebook,
  Instagram,
  MessageCircle,
  Send
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="w-full" style={{ backgroundColor: 'rgb(246 246 246 / 99%)' }}>
      {/* First Section - Feature Cards */}
      <div className="border-b border-gray-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Delivery */}
            <div className="flex items-start gap-4">
              <div className="bg-[#ff006e]/20 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-[#ff006e]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Free Shipping</h3>
                <p className="text-gray-600 text-sm">
                  Get Free Shipping on All Orders Above Rs.500
                </p>
              </div>
            </div>

            {/* Customer Service */}
            <div className="flex items-start gap-4">
              <div className="bg-[#00d4ff]/20 p-3 rounded-lg">
                <Headphones className="h-6 w-6 text-[#00d4ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Excellent Customer Support to Solve your queries from order to delivery.
                </p>
              </div>
            </div>

            {/* Credit Card */}
            <div className="flex items-start gap-4">
              <div className="bg-[#ff006e]/20 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-[#ff006e]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Online Payment</h3>
                <p className="text-gray-600 text-sm">
                  All Indian Payment method Accepted. SSL Secured.
                </p>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="flex items-start gap-4">
              <div className="bg-[#00d4ff]/20 p-3 rounded-lg">
                <Package className="h-6 w-6 text-[#00d4ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  1-7 Days Shipping Anywhere in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section - Links & Information */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* GET TO KNOW US */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">GET TO KNOW US</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Latest News
                </Link>
              </li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help/payments" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Payments
                </Link>
              </li>
              <li>
                <Link href="/help/returns" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/help/shipping" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/help/cancellation" className="text-gray-600 hover:text-[#ff006e] transition-colors">
                  Cancellation & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Join our newsletter!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Will be used in accordance with our Privacy Policy
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff006e] text-gray-900 placeholder-gray-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#ff006e] hover:bg-[#d4005a] text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Payment Systems, Social Links & Shipping Partner - 3 Columns */}
        <div className="border-t border-gray-300 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 - Payment System */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Payment System:</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">UPI</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">Card</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">Net Banking</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">Wallet</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">COD</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Social Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Our Social Links:</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 hover:bg-[#1877f2] text-gray-700 hover:text-white p-3 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500 text-gray-700 hover:text-white p-3 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 hover:bg-[#25d366] text-gray-700 hover:text-white p-3 rounded-full transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Column 3 - Shipping Partner */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Shipping Partner:</h3>
              <div className="bg-white px-6 py-3 rounded-lg inline-block">
                <Image
                  src="/shiprocket-logo.svg"
                  alt="Shiprocket"
                  width={210}
                  height={44}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 pt-8 mt-8 text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} Tobo Digital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
