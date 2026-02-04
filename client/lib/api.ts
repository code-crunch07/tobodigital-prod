import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategoryBySlug = async (slug: string) => {
  const response = await api.get(`/categories/slug/${slug}`);
  return response.data;
};

// Subcategories
export const getSubCategories = async (categoryId?: string) => {
  const url = categoryId ? `/subcategories/category/${categoryId}` : '/subcategories';
  const response = await api.get(url);
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
  return response.data;
};

// Promotion Banners
export const getPromotionBanners = async () => {
  const response = await api.get('/banners/promotion');
  return response.data;
};

// Promo Row Banners (two side-by-side banners)
export const getPromoRowBanners = async () => {
  const response = await api.get('/banners/promo-row');
  return response.data;
};

// Get banners by category
export const getBannersByCategory = async (slug: string, type?: 'slider' | 'promotion' | 'promo-row') => {
  const response = await api.get(`/banners/category/${slug}`, { params: { type } });
  return response.data;
};

// Navigation
export const getNavigations = async () => {
  const response = await api.get('/navigations');
  return response.data;
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
