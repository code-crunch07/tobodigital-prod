'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Layers,
  Warehouse,
  BarChart3,
  Megaphone,
  FileText,
  Settings,
  FileBarChart,
  Code,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  List,
  Image,
  Tag,
  Search,
  Truck,
  RotateCcw,
  Star,
  Heart,
  Building2,
  AlertTriangle,
  Upload,
  TrendingUp,
  Eye,
  Activity,
  Gift,
  Film,
  Mail,
  Bell,
  Home,
  BookOpen,
  FileCheck,
  MessageSquare,
  Shield,
  Database,
  Puzzle,
  Navigation,
  Key,
  Book,
  Server,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCategories, getSubCategories, getProducts, getOrders } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCategory, createSubCategory } from '@/lib/api';
import { Tooltip } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/SidebarContext';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed } = useSidebar();
  const [userRole, setUserRole] = useState<string>('customer');

  useEffect(() => {
    try {
      const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userJson) {
        const u = JSON.parse(userJson);
        setUserRole(u?.role || 'customer');
      }
    } catch {
      setUserRole('customer');
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Expanded states for all sections - only one can be open at a time
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const isAdmin = userRole === 'admin';

  // Helper functions for section state
  const productsExpanded = expandedSection === 'products';
  const ordersExpanded = expandedSection === 'orders';
  const customersExpanded = expandedSection === 'customers';
  const categoriesExpanded = expandedSection === 'categories';
  const inventoryExpanded = expandedSection === 'inventory';
  const analyticsExpanded = expandedSection === 'analytics';
  const marketingExpanded = expandedSection === 'marketing';
  const contentExpanded = expandedSection === 'content';
  const settingsExpanded = expandedSection === 'settings';
  const reportsExpanded = expandedSection === 'reports';
  const developerExpanded = expandedSection === 'developer';
  
  // Auto-expand section if pathname matches
  useEffect(() => {
    if (pathname.startsWith('/products')) {
      setExpandedSection('products');
    } else if (pathname.startsWith('/orders')) {
      setExpandedSection('orders');
    } else if (pathname.startsWith('/customers')) {
      setExpandedSection('customers');
    } else if (pathname.startsWith('/categories') || pathname.startsWith('/subcategories') || pathname.startsWith('/brands')) {
      setExpandedSection('categories');
    } else if (pathname.startsWith('/inventory')) {
      setExpandedSection('inventory');
    } else if (pathname.startsWith('/analytics')) {
      setExpandedSection('analytics');
    } else if (pathname.startsWith('/marketing')) {
      setExpandedSection('marketing');
    } else if (pathname.startsWith('/content')) {
      setExpandedSection('content');
    } else if (pathname.startsWith('/settings')) {
      setExpandedSection('settings');
    } else if (pathname.startsWith('/reports')) {
      setExpandedSection('reports');
    } else if (pathname.startsWith('/developer')) {
      setExpandedSection('developer');
    }
  }, [pathname]);

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubCategoryDialog, setOpenSubCategoryDialog] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [subCategoryFormData, setSubCategoryFormData] = useState({ name: '', description: '', category: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, subCategoriesRes, productsRes, ordersRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getSubCategories().catch(() => ({ data: [] })),
        getProducts({ limit: 10 }).catch(() => ({ data: { products: [] } })),
        getOrders({ limit: 10 }).catch(() => ({ data: { orders: [] } })),
      ]);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
      setProducts(productsRes.data?.products || []);
      setOrders(ordersRes.data?.orders || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(categoryFormData);
      setOpenCategoryDialog(false);
      setCategoryFormData({ name: '', description: '' });
      loadData();
      router.push('/categories');
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubCategory(subCategoryFormData);
      setOpenSubCategoryDialog(false);
      setSubCategoryFormData({ name: '', description: '', category: '' });
      loadData();
      router.push('/subcategories');
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      alert(error.response?.data?.message || 'Failed to create subcategory');
    }
  };

  const getSubCategoriesForCategory = (categoryId: string) => {
    return subCategories.filter((sub) => sub.category === categoryId || sub.category?._id === categoryId);
  };

  // Active state for individual links: exact match (no multi-selection)
  const isActive = (href: string) => {
    const pathWithoutQuery = pathname.split('?')[0];
    const normalizedPathname =
      pathWithoutQuery.endsWith('/') && pathWithoutQuery.length > 1
        ? pathWithoutQuery.slice(0, -1)
        : pathWithoutQuery;
    const normalizedHref =
      href.endsWith('/') && href.length > 1 ? href.slice(0, -1) : href;

    return normalizedPathname === normalizedHref;
  };
  
  // Section active: highlight parent section when any child path is under it
  const isSectionActive = (hrefs: string[]) => {
    const pathWithoutQuery = pathname.split('?')[0];
    return hrefs.some((href) => {
      const normalizedHref =
        href.endsWith('/') && href.length > 1 ? href.slice(0, -1) : href;
      return (
        pathWithoutQuery === normalizedHref ||
        pathWithoutQuery.startsWith(`${normalizedHref}/`)
      );
    });
  };

  const renderCollapsibleSection = (
    title: string,
    Icon: any,
    sectionKey: string,
    expanded: boolean,
    isActiveSection: boolean,
    children: React.ReactNode
  ) => {
    const handleToggle = () => {
      // When collapsed, don't allow expanding sections
      if (isCollapsed) return;
      // If clicking on the same section, collapse it. Otherwise, expand the clicked section
      setExpandedSection(expanded ? null : sectionKey);
    };
    
    const buttonContent = (
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
          isCollapsed ? 'justify-center px-2' : '',
          isActiveSection
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <div className={cn('flex items-center gap-3', isCollapsed && 'gap-0')}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && (
          expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip content={title} side="right">
          <div className="mt-2">{buttonContent}</div>
        </Tooltip>
      );
    }
    
    return (
      <div className="mt-2">
        {buttonContent}
        {expanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary pl-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderMenuLink = (href: string, label: string, icon?: any, isSubItem = false) => {
    const Icon = icon;
    const linkContent = (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors',
          isCollapsed ? 'justify-center px-2' : '',
          isSubItem ? 'py-1.5' : 'py-2',
          isActive(href)
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip content={label} side="right">
          {linkContent}
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-lg shadow-md bg-background border-border hover:bg-muted transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile backdrop - tap to close */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
          isCollapsed ? 'w-64 lg:w-20' : 'w-64'
        )}
      >
        <div className="h-full px-4 py-4 overflow-y-auto">
          <div className={cn("flex items-center justify-center mb-8 mt-4 lg:mt-0", isCollapsed ? "" : "")}>
            {!isCollapsed ? (
              <Link href="/" className="flex items-center">
                <NextImage
                  src="/tobo-logo.png"
                  alt="Tobo Digital"
                  width={100}
                  height={40}
                  className="object-contain h-8 w-auto"
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="flex items-center justify-center w-full">
                <NextImage
                  src="/tobo-logo.png"
                  alt="Tobo Digital"
                  width={32}
                  height={32}
                  className="object-contain h-8 w-8"
                  priority
                />
              </Link>
            )}
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActiveItem = pathname === item.href;
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isCollapsed ? 'justify-center px-2' : '',
                    isActiveItem
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name} content={item.name} side="right">
                    {linkContent}
                  </Tooltip>
                );
              }

              return linkContent;
            })}

            {/* Products Section */}
            {renderCollapsibleSection(
              'Products',
              Package,
              'products',
              productsExpanded,
              isSectionActive(['/products']),
              <>
                {renderMenuLink('/products/add', 'Add Product', Plus)}
                {renderMenuLink('/products', 'Product List', List)}
                {renderMenuLink('/products/media', 'Media Manager', Image)}
                {renderMenuLink('/products/attributes', 'Product Attributes', Tag)}
                {renderMenuLink('/products/seo', 'SEO / Meta Data Manager', Search)}
              </>
            )}

            {/* Orders Section */}
            {renderCollapsibleSection(
              'Orders',
              ShoppingCart,
              'orders',
              ordersExpanded,
              isSectionActive(['/orders']),
              <>
                {renderMenuLink('/orders/add', 'Create Order', Plus)}
                {renderMenuLink('/orders', 'All Orders', List)}
                {renderMenuLink('/orders/recent', 'Recent Orders', Clock)}
                {renderMenuLink('/orders/shipping', 'Shipping & Delivery', Truck)}
                {renderMenuLink('/orders/returns', 'Returns / Refunds', RotateCcw)}
              </>
            )}

            {/* Customers Section */}
            {renderCollapsibleSection(
              'Customers',
              Users,
              'customers',
              customersExpanded,
              isSectionActive(['/customers']),
              <>
                {renderMenuLink('/customers', 'All Customers', List)}
                {renderMenuLink('/customers/loyalty', 'Loyalty & Rewards', Star)}
                {renderMenuLink('/customers/reviews', 'Customer Reviews', FileText)}
                {renderMenuLink('/customers/wishlist', 'Wishlist / Saved Items', Heart)}
              </>
            )}

            {/* Categories Section */}
            {renderCollapsibleSection(
              'Categories',
              Layers,
              'categories',
              categoriesExpanded,
              isSectionActive(['/categories', '/subcategories', '/brands']),
              <>
                {/* Add New Category */}
                <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>
                        Create a new product category
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={categoryFormData.name}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          value={categoryFormData.description}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenCategoryDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {renderMenuLink('/categories', 'All Categories', List)}
                {renderMenuLink('/subcategories', 'Subcategories', Layers)}
                {renderMenuLink('/brands', 'Brands / Manufacturers', Building2)}

                {/* Add New Subcategory */}
                <Dialog open={openSubCategoryDialog} onOpenChange={setOpenSubCategoryDialog}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Subcategory
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Subcategory</DialogTitle>
                      <DialogDescription>
                        Create a new product subcategory
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Parent Category *</Label>
                        <Select
                          value={subCategoryFormData.category}
                          onValueChange={(value) =>
                            setSubCategoryFormData({ ...subCategoryFormData, category: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={subCategoryFormData.name}
                          onChange={(e) =>
                            setSubCategoryFormData({ ...subCategoryFormData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          value={subCategoryFormData.description}
                          onChange={(e) =>
                            setSubCategoryFormData({ ...subCategoryFormData, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpenSubCategoryDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Inventory Section */}
            {renderCollapsibleSection(
              'Inventory',
              Warehouse,
              'inventory',
              inventoryExpanded,
              isSectionActive(['/inventory']),
              <>
                {renderMenuLink('/inventory/overview', 'Stock Overview', Package)}
                {renderMenuLink('/inventory/alerts', 'Low Stock Alerts', AlertTriangle)}
                {renderMenuLink('/inventory/import-export', 'Import / Export Inventory', Upload)}
              </>
            )}

            {/* Analytics Section */}
            {renderCollapsibleSection(
              'Analytics',
              BarChart3,
              'analytics',
              analyticsExpanded,
              isSectionActive(['/analytics']),
              <>
                {renderMenuLink('/analytics/sales', 'Sales Overview', TrendingUp)}
                {renderMenuLink('/analytics/products', 'Product Performance', Eye)}
                {renderMenuLink('/analytics/customers', 'Customer Insights', Activity)}
                {renderMenuLink('/analytics/orders', 'Order Trends', FileText)}
              </>
            )}

            {/* Marketing Section */}
            {renderCollapsibleSection(
              'Marketing',
              Megaphone,
              'marketing',
              marketingExpanded,
              isSectionActive(['/marketing']),
              <>
                {renderMenuLink('/marketing/promotions', 'Promotions / Coupons', Gift)}
                {renderMenuLink('/marketing/banners', 'Banners / Home Slider', Film)}
                {renderMenuLink('/marketing/email', 'Email Campaigns', Mail)}
                {renderMenuLink('/marketing/push', 'Push Notifications', Bell)}
                {renderMenuLink('/marketing/seo', 'SEO Tools', Search)}
              </>
            )}

            {/* Content Section */}
            {renderCollapsibleSection(
              'Content',
              FileText,
              'content',
              contentExpanded,
              isSectionActive(['/content']),
              <>
                {renderMenuLink('/content/navigation', 'Navigation / Menu', Navigation)}
                {renderMenuLink('/content/home', 'Home Page Blocks', Home)}
                {renderMenuLink('/content/blog', 'Blog / Articles', BookOpen)}
                {renderMenuLink('/content/legal', 'Legal Pages', FileCheck)}
                {renderMenuLink('/content/testimonials', 'Testimonials', MessageSquare)}
              </>
            )}

            {/* Settings Section (admin only) */}
            {isAdmin && renderCollapsibleSection(
              'Settings',
              Settings,
              'settings',
              settingsExpanded,
              isSectionActive(['/settings']),
              <>
                {renderMenuLink('/settings/admins', 'Admin Users / Roles', Users)}
                {renderMenuLink('/settings/site', 'Site Settings', Settings)}
                {renderMenuLink('/settings/security', 'Security & Access', Shield)}
                {renderMenuLink('/settings/backups', 'Backups', Database)}
                {renderMenuLink('/settings/integrations', 'Integrations', Puzzle)}
              </>
            )}

            {/* Reports Section (admin only) */}
            {isAdmin && renderCollapsibleSection(
              'Reports',
              FileBarChart,
              'reports',
              reportsExpanded,
              isSectionActive(['/reports']),
              <>
                {renderMenuLink('/reports/sales', 'Sales Report', TrendingUp)}
                {renderMenuLink('/reports/stock', 'Stock Report', Warehouse)}
                {renderMenuLink('/reports/orders', 'Order Report', ShoppingCart)}
                {renderMenuLink('/reports/customers', 'Customer Report', Users)}
              </>
            )}

            {/* Developer Section */}
            {renderCollapsibleSection(
              'Developer',
              Code,
              'developer',
              developerExpanded,
              isSectionActive(['/developer']),
              <>
                {renderMenuLink('/developer/api-keys', 'API Keys', Key)}
                {renderMenuLink('/developer/api-docs', 'API Docs', Book)}
                {renderMenuLink('/developer/logs', 'System Logs / Server Status', Server)}
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
