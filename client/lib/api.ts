import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

function resolveUploadUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const u = new URL(pathOrUrl);
      if (u.pathname.includes('/uploads/')) {
        const afterUploads = u.pathname.split('/uploads/').pop() || '';
        return `${API_ORIGIN}/uploads/${afterUploads}${u.search}`;
      }
    } catch (_) {}
    return pathOrUrl;
  }
  if (pathOrUrl.includes('/uploads/')) {
    const afterUploads = pathOrUrl.split('/uploads/').pop() || '';
    return `${API_ORIGIN}/uploads/${afterUploads}`;
  }
  return `${API_ORIGIN}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function normalizeProduct(p: any) {
  if (!p) return p;
  if (p.mainImage) p.mainImage = resolveUploadUrl(p.mainImage);
  if (Array.isArray(p.galleryImages)) p.galleryImages = p.galleryImages.map((x: string) => resolveUploadUrl(x));
  // Some pages use images[]
  if (Array.isArray(p.images)) p.images = p.images.map((x: string) => resolveUploadUrl(x));
  return p;
}

function normalizeCategory(c: any) {
  if (!c) return c;
  if (c.image) c.image = resolveUploadUrl(c.image);
  if (c.bannerImage) c.bannerImage = resolveUploadUrl(c.bannerImage);
  return c;
}

function normalizeBanner(b: any) {
  if (!b) return b;
  if (b.image) b.image = resolveUploadUrl(b.image);
  return b;
}

function normalizeNavigation(n: any) {
  if (!n) return n;
  if (n.megaMenuImage) n.megaMenuImage = resolveUploadUrl(n.megaMenuImage);
  if (Array.isArray(n.megaMenuColumns)) {
    n.megaMenuColumns = n.megaMenuColumns.map((col: any) => ({
      ...col,
      links: Array.isArray(col?.links)
        ? col.links.map((l: any) => ({ ...l, image: l?.image ? resolveUploadUrl(l.image) : l?.image }))
        : col?.links,
    }));
  }
  return n;
}

const api = axios.create({
  baseURL: `${API_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API (separate instance for auth endpoints)
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  const payload = response.data;
  const products = payload?.data?.products;
  if (Array.isArray(products)) {
    payload.data.products = products.map(normalizeProduct);
  }
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  const payload = response.data;
  if (payload?.data) payload.data = normalizeProduct(payload.data);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeCategory);
  return response.data;
};

export const getCategoryBySlug = async (slug: string) => {
  const response = await api.get(`/categories/slug/${slug}`);
  const payload = response.data;
  if (payload?.data) payload.data = normalizeCategory(payload.data);
  return response.data;
};

// Subcategories
export const getSubCategories = async (categoryId?: string) => {
  const url = categoryId ? `/subcategories/category/${categoryId}` : '/subcategories';
  const response = await api.get(url);
  const payload = response.data;
  if (Array.isArray(payload?.data)) {
    payload.data = payload.data.map((s: any) => {
      if (s?.image) s.image = resolveUploadUrl(s.image);
      return s;
    });
  }
  return response.data;
};

// New Arrivals (recent products)
export const getNewArrivals = async (limit: number = 8) => {
  const response = await api.get('/products', {
    params: {
      limit,
      sort: 'newest',
    },
  });
  return response.data;
};

// Featured Products
export const getFeaturedProducts = async (limit: number = 8) => {
  const response = await api.get('/products', {
    params: {
      featured: 'true',
      limit,
    },
  });
  return response.data;
};

// Sale Products
export const getSaleProducts = async (limit: number = 8) => {
  const response = await api.get('/products', {
    params: {
      sale: 'true',
      limit,
    },
  });
  return response.data;
};

// Banners
export const getBanners = async (type?: 'slider' | 'promotion' | 'promo-row') => {
  const response = await api.get('/banners', { params: { type: type || 'slider' } });
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeBanner);
  return response.data;
};

// Promotion Banners
export const getPromotionBanners = async () => {
  const response = await api.get('/banners/promotion');
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeBanner);
  return response.data;
};

// Promo Row Banners (two side-by-side banners)
export const getPromoRowBanners = async () => {
  const response = await api.get('/banners/promo-row');
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeBanner);
  return response.data;
};

// Get banners by category
export const getBannersByCategory = async (slug: string, type?: 'slider' | 'promotion' | 'promo-row') => {
  const response = await api.get(`/banners/category/${slug}`, { params: { type } });
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeBanner);
  return response.data;
};

// Navigation
export const getNavigations = async () => {
  const response = await api.get('/navigations');
  const payload = response.data;
  if (Array.isArray(payload?.data)) payload.data = payload.data.map(normalizeNavigation);
  return response.data;
};

// Public site settings (logo, name, url, favicon)
export const getPublicSiteSettings = async () => {
  const response = await api.get('/site-settings');
  const payload = response.data;
  if (payload?.data?.logo) payload.data.logo = resolveUploadUrl(payload.data.logo);
  if (payload?.data?.favicon) payload.data.favicon = resolveUploadUrl(payload.data.favicon);
  return payload;
};

// Auth functions
export const signup = async (data: { name: string; email: string; password: string; role?: string }) => {
  const response = await authApi.post('/auth/signup', data);
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }
  const response = await authApi.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Notifications (backend at /api/notifications - use authApi base URL)
export const getNotifications = async (params?: { limit?: number; unreadOnly?: boolean }) => {
  try {
    const response = await authApi.get('/notifications', { params });
    return response.data;
  } catch (error: any) {
    console.warn('Notifications API error:', error?.response?.status, error?.message);
    return { success: false, data: [], unreadCount: 0 };
  }
};

export default api;
