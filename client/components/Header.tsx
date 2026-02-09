'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Search, Menu, X, ChevronDown, Heart, User, LogOut, UserCircle, Package, FileText } from 'lucide-react';
import { getCategories, getNavigations, getPublicSiteSettings } from '@/lib/api';
import LoginSignupDialog from './LoginSignupDialog';
import CartPanel from './CartPanel';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface NavigationLink {
  _id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  hasMegaMenu: boolean;
  megaMenuColumns?: Array<{
    title?: string;
    links: Array<{
      label: string;
      href: string;
      description?: string;
      image?: string;
      isCategory?: boolean;
      isExternal?: boolean;
    }>;
  }>;
  megaMenuImage?: string;
  megaMenuWidth?: 'default' | 'wide' | 'full';
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, updateQuantity, removeFromCart, getCartItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]);
  const [navigations, setNavigations] = useState<NavigationLink[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>('/tobo-logo.png');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMegaMenus, setOpenMegaMenus] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  // Smart sticky: hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Client-only mount so wishlist count doesn't hydrate mismatch (localStorage)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      setIsLoggedIn(!!token);
      if (user) {
        try {
          setUserData(JSON.parse(user));
        } catch (e) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };
    checkAuth();
    // Listen for storage changes (if login happens in another tab)
    window.addEventListener('storage', checkAuth);
    // Listen for custom auth state change event (same tab login)
    window.addEventListener('authStateChanged', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    setUserMenuOpen(false);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    // Redirect to home page
    router.push('/');
  };

  useEffect(() => {
    loadCategories();
    loadNavigations();
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const res = await getPublicSiteSettings();
      const logo = res?.data?.logo;
      if (logo) setSiteLogo(logo);
    } catch {
      // ignore - fallback logo stays
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNavigations = async () => {
    try {
      const response = await getNavigations();
      const activeNavs = (response.data || []).filter((nav: NavigationLink) => nav.isActive);
      setNavigations(activeNavs.sort((a: NavigationLink, b: NavigationLink) => a.order - b.order));
    } catch (error) {
      console.error('Error loading navigations:', error);
    }
  };

  const toggleMegaMenu = (navId: string) => {
    setOpenMegaMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(navId)) {
        newSet.delete(navId);
      } else {
        newSet.add(navId);
      }
      return newSet;
    });
  };

  const getCategoryLink = (href: string) => {
    // If href is a category slug, format it properly
    const category = categories.find(cat => cat.slug === href || cat._id === href);
    if (category) {
      return `/product-category/${category.slug || category._id}`;
    }
    return href.startsWith('/') ? href : `/${href}`;
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = getCartItemCount();
  const wishlistCount = mounted ? wishlistItems.length : 0;

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full max-w-[100vw] transition-transform duration-300 ease-out ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 min-w-0 gap-2">
          {/* Logo - high quality rendering */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group flex-shrink-0"
            onClick={(e) => {
              // If already on home page, force full reload to refresh content
              if (pathname === '/') {
                e.preventDefault();
                window.location.href = '/';
              }
            }}
          >
            <Image
              src={siteLogo}
              alt="Tobo Digital"
              width={300}
              height={120}
              className="object-contain h-7 w-auto sm:h-8"
              priority
              quality={100}
              style={{ imageRendering: 'auto' }}
            />
          </Link>

          {/* Desktop Navigation - Aligned to Right */}
          <nav className="hidden md:flex items-center flex-shrink min-w-0 space-x-4 lg:space-x-6 xl:space-x-8 ml-auto mr-2 lg:mr-4">
            {navigations.length > 0 ? (
              navigations.map((nav) => (
                <div
                  key={nav._id}
                  className="relative group inline-block"
                  onMouseEnter={() => nav.hasMegaMenu && toggleMegaMenu(nav._id)}
                  onMouseLeave={() => nav.hasMegaMenu && toggleMegaMenu(nav._id)}
                >
                  {nav.hasMegaMenu ? (
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap">
                      <span>{nav.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      href={nav.href}
                      target={nav.isExternal ? '_blank' : '_self'}
                      rel={nav.isExternal ? 'noopener noreferrer' : undefined}
                      className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                    >
                      {nav.label}
                    </Link>
                  )}

                  {/* Mega Menu Dropdown - centered under trigger, constrained to viewport */}
                  {nav.hasMegaMenu && openMegaMenus.has(nav._id) && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-6 sm:p-8 ${
                        nav.megaMenuWidth === 'full'
                          ? 'w-[calc(100vw-2rem)]'
                          : nav.megaMenuWidth === 'wide'
                          ? 'w-[min(80rem,calc(100vw-2rem))]'
                          : 'w-[min(72rem,calc(100vw-2rem))]'
                      }`}
                    >
                      <div className={`grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 ${nav.megaMenuImage ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                        {nav.megaMenuColumns?.map((column, colIndex) => (
                          <div key={colIndex} className="space-y-3">
                            {column.title && (
                              <h3 className="font-bold text-gray-900 mb-4">{column.title}</h3>
                            )}
                            <div className="space-y-2">
                              {column.links.map((link, linkIndex) => {
                                const linkHref = link.isCategory ? getCategoryLink(link.href) : link.href;
                                return (
                                  <Link
                                    key={linkIndex}
                                    href={linkHref}
                                    target={link.isExternal ? '_blank' : '_self'}
                                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    {link.image && (
                                      <img
                                        src={link.image}
                                        alt={link.label}
                                        className="w-full h-24 object-cover rounded mb-2"
                                      />
                                    )}
                                    <div className="font-medium text-gray-900 group-hover:text-[#ff006e] transition-colors">
                                      {link.label}
                                    </div>
                                    {link.description && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {link.description}
                                      </div>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {nav.megaMenuImage && (
                          <div className="col-span-1">
                            <img
                              src={nav.megaMenuImage}
                              alt="Promotional"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Fallback to default navigation if no dashboard navigation exists
              <>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  Home
                </Link>
                <Link
                  href="/new-arrivals"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/shop"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  About Us
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  Blog
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium whitespace-nowrap"
                >
                  Contact Us
                </Link>
              </>
            )}
          </nav>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-gray-300 mx-2 lg:mx-3"></div>

          {/* Right Side Actions - Icons */}
          <div className="flex items-center space-x-1 md:space-x-1.5 flex-shrink-0">
            {/* Search Icon */}
            <div className="relative search-container">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-[#ff006e] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              {/* Desktop: Search Dropdown */}
              <div className="hidden md:block">
                {searchOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-[70]">
                      <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }
                          }}
                        />
                        <button
                          type="submit"
                          className="bg-[#ff006e] text-white px-4 py-2 rounded-lg hover:bg-[#d4005a] transition-colors flex items-center justify-center"
                          aria-label="Search"
                        >
                          <Search className="h-5 w-5" />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Wishlist Icon */}
            <Link
              href="/my-account/wishlist"
              className="p-2 text-gray-700 hover:text-[#ff006e] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#ff006e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* User Icon - Opens Login/Signup or User Dropdown Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-gray-700 hover:text-[#ff006e] transition-colors"
                  aria-label="My Account"
                >
                  <User className="h-5 w-5" />
                </button>
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] overflow-hidden">
                      {/* User Info */}
                      {userData && (
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userData.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userData.email || ''}
                          </p>
                        </div>
                      )}
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/my-account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                          My Account
                        </Link>
                        <Link
                          href="/my-account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Package className="h-4 w-4 mr-3 text-gray-500" />
                          Orders
                        </Link>
                        <Link
                          href="/my-account/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-3 text-gray-500" />
                            Wishlist
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-[#ff006e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold ml-2">
                              {wishlistCount > 9 ? '9+' : wishlistCount}
                            </span>
                          )}
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginDialogOpen(true)}
                className="p-2 text-gray-700 hover:text-[#ff006e] transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </button>
            )}

            {/* Cart Icon - Opens Cart Panel */}
            <button
              onClick={() => setCartPanelOpen(true)}
              className="p-2 text-gray-700 hover:text-[#ff006e] transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#ff006e] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Search – full-width overlay bar, below sticky header */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-x-0 top-14 bottom-0 bg-black/30 z-[70] md:hidden"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
            aria-hidden="true"
          />
          <div className="fixed top-14 left-0 right-0 z-[75] md:hidden bg-[#d3d3d3] px-3 py-2">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 w-full bg-white rounded-full shadow-sm border border-gray-200 px-3 py-2"
            >
              <Search className="h-5 w-5 text-gray-700 flex-shrink-0" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 min-w-0 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                aria-label="Search"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1.5 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      )}

      {/* Mobile menu overlay + drawer rendered in portal so they are never hidden by header/overflow */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-[100] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}
          <div
            className={`fixed left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-[110] md:hidden transform transition-transform duration-300 ease-out flex flex-col ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col space-y-4 min-h-0">
              {navigations.length > 0 ? (
                navigations.map((nav) => (
                  <div key={nav._id}>
                    {nav.hasMegaMenu ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleMegaMenu(nav._id)}
                          className="flex items-center justify-between w-full text-gray-700 hover:text-[#ff006e] transition-colors font-medium"
                        >
                          <span>{nav.label}</span>
                          {openMegaMenus.has(nav._id) ? (
                            <ChevronDown className="h-4 w-4 rotate-180 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                        {openMegaMenus.has(nav._id) && nav.megaMenuColumns && (
                          <div className="pl-4 space-y-2">
                            {nav.megaMenuColumns.map((column, colIndex) => (
                              <div key={colIndex} className="space-y-2">
                                {column.title && (
                                  <div className="text-sm font-semibold text-gray-600 mt-2">
                                    {column.title}
                                  </div>
                                )}
                                {column.links.map((link, linkIndex) => {
                                  const linkHref = link.isCategory ? getCategoryLink(link.href) : link.href;
                                  return (
                                    <Link
                                      key={linkIndex}
                                      href={linkHref}
                                      target={link.isExternal ? '_blank' : '_self'}
                                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                                      className="block text-gray-600 hover:text-[#ff006e] transition-colors"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {link.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={nav.href}
                        target={nav.isExternal ? '_blank' : '_self'}
                        rel={nav.isExternal ? 'noopener noreferrer' : undefined}
                        className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {nav.label}
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <Link href="/" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link href="/new-arrivals" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
                  <Link href="/shop" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                  <Link href="/about" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                  <Link href="/blog" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                  <Link href="/contact" className="text-gray-700 hover:text-[#ff006e] transition-colors font-medium block" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                </>
              )}
            </nav>
          </div>
        </>,
        document.body
      )}

      {/* Login/Signup Dialog */}
      <LoginSignupDialog
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
      />

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartPanelOpen}
        onClose={() => setCartPanelOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </header>
  );
}
