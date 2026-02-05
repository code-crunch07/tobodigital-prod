'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPublicCategories } from '@/lib/api-public';

export default function ClientHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Close mobile menu automatically when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const loadCategories = async () => {
    try {
      const response = await getPublicCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/client' },
    { name: 'New Arrivals', href: '/client/new-arrivals' },
    { name: 'Shop', href: '/client/shop', hasMegaMenu: true },
    { name: 'About Us', href: '/client/about' },
    { name: 'Blog', href: '/client/blog' },
    { name: 'Contact Us', href: '/client/contact' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/client" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-pink-500">tobo</span>
              <span className="text-blue-400">digital</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative group"
                onMouseEnter={() => link.hasMegaMenu && setIsShopMenuOpen(true)}
                onMouseLeave={() => link.hasMegaMenu && setIsShopMenuOpen(false)}
              >
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                  {link.hasMegaMenu && <ChevronDown className="inline-block ml-1 h-4 w-4" />}
                </Link>

                {/* Mega Menu for Shop */}
                {link.hasMegaMenu && isShopMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-screen max-w-6xl bg-card border rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-4 gap-6">
                      {/* Categories */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm">Shop by Category</h3>
                        <ul className="space-y-2">
                          {categories.slice(0, 6).map((category) => (
                            <li key={category._id}>
                              <Link
                                href={`/client/shop?category=${category._id}`}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Featured Collections */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm">Featured</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link
                              href="/client/shop?featured=true"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Featured Products
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/new-arrivals"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              New Arrivals
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?sale=true"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              On Sale
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?bestsellers=true"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Bestsellers
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Shop by Price */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm">Shop by Price</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link
                              href="/client/shop?price=0-50"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Under ₹50
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?price=50-100"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              ₹50 - ₹100
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?price=100-200"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              ₹100 - ₹200
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?price=200+"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              ₹200 & Above
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Quick Links */}
                      <div>
                        <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link
                              href="/client/shop?view=all"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              View All Products
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?sort=popular"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Popular Items
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?sort=newest"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Newest First
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?sort=price-low"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Price: Low to High
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/client/shop?sort=price-high"
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              Price: High to Low
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-64"
                />
              </div>
            </div>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu (slide-in from left on small screens) */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-background shadow-xl border-r flex flex-col py-4 px-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full"
                />
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
