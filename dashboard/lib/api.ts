import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/** API origin (no /api) for serving uploads. Use for building image URLs. */
export const API_UPLOAD_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const BASE_PATH = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_PATH) || '';

/** Normalize to /uploads/... path for proxy or API. */
function getUploadPath(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const u = new URL(pathOrUrl);
      if (u.pathname.includes('/uploads/')) {
        const after = u.pathname.split('/uploads/').pop() || '';
        return `/uploads/${after}`;
      }
      return u.pathname;
    } catch (_) {}
    return pathOrUrl;
  }
  return pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
}

/**
 * Return URL for an upload path. Uses same-origin proxy to avoid ERR_BLOCKED_BY_ORB when dashboard and API are on different origins.
 */
export function getUploadUrl(pathOrUrl: string | undefined): string {
  const path = getUploadPath(pathOrUrl);
  if (!path) return '';
  // Same-origin proxy so browser never does cross-origin request (no ORB)
  return `${BASE_PATH}/api/proxy-image?path=${encodeURIComponent(path)}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network error - backend server may not be running:', error.config?.url);
      // Return a rejected promise with a more descriptive error
      return Promise.reject({
        ...error,
        message: 'Unable to connect to server. Please ensure the backend server is running.',
        isNetworkError: true,
      });
    }
    return Promise.reject(error);
  }
);

// Upload API for FormData (do not set Content-Type; axios sets multipart/form-data with boundary)
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token for upload API
uploadApi.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Dashboard Analytics
export const getAnalyticsCustomers = async () => {
  const response = await api.get('/dashboard/analytics/customers');
  return response.data;
};

export const getAnalyticsSales = async () => {
  const response = await api.get('/dashboard/analytics/sales');
  return response.data;
};

export const getAnalyticsOrders = async () => {
  const response = await api.get('/dashboard/analytics/orders');
  return response.data;
};

export const getAnalyticsProducts = async () => {
  const response = await api.get('/dashboard/analytics/products');
  return response.data;
};

// Reports (admin, optional date range)
export const getReportCustomers = async (params?: { start?: string; end?: string }) => {
  const response = await api.get('/reports/customers', { params });
  return response.data;
};

export const getReportOrders = async (params?: { start?: string; end?: string }) => {
  const response = await api.get('/reports/orders', { params });
  return response.data;
};

export const getReportSales = async (params?: { start?: string; end?: string }) => {
  const response = await api.get('/reports/sales', { params });
  return response.data;
};

export const getReportStock = async () => {
  const response = await api.get('/reports/stock');
  return response.data;
};

// Products
export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const bulkDeleteProducts = async (ids: string[]) => {
  const response = await api.delete('/products/bulk', { data: { ids } });
  return response.data;
};

export const duplicateProduct = async (id: string) => {
  const response = await api.post(`/products/${id}/duplicate`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  try {
  const response = await api.get('/categories');
    return response.data;
  } catch (error: any) {
    // Return empty data structure if network error
    if (error.isNetworkError) {
      return { data: [] };
    }
    throw error;
  }
};

export const getCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: any) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// SubCategories
export const getSubCategories = async (categoryId?: string) => {
  const url = categoryId ? `/subcategories/category/${categoryId}` : '/subcategories';
  const response = await api.get(url);
  return response.data;
};

export const createSubCategory = async (data: any) => {
  const response = await api.post('/subcategories', data);
  return response.data;
};

export const updateSubCategory = async (id: string, data: any) => {
  const response = await api.put(`/subcategories/${id}`, data);
  return response.data;
};

export const deleteSubCategory = async (id: string) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};

// Orders
export const getOrders = async (params?: any) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: any) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const updateOrder = async (id: string, data: any) => {
  const response = await api.put(`/orders/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id: string) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

// Customers
export const getCustomers = async (params?: any) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomerById = async (id: string) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const updateCustomerTheme = async (id: string, theme: 'light' | 'dark') => {
  const response = await api.patch(`/customers/${id}/theme`, { theme });
  return response.data;
};

// Coupons (Marketing > Promotions)
export const getCoupons = async () => {
  try {
    const response = await api.get('/coupons');
    return response.data;
  } catch (error: any) {
    if (error.isNetworkError) {
      return { success: false, data: [] };
    }
    throw error;
  }
};

export const createCoupon = async (data: {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive?: boolean;
}) => {
  const response = await api.post('/coupons', data);
  return response.data;
};

export const updateCoupon = async (id: string, data: Partial<{
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
}>) => {
  const response = await api.put(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};

// Banners
export const getBanners = async () => {
  const response = await api.get('/banners');
  return response.data;
};

export const getBannerById = async (id: string) => {
  const response = await api.get(`/banners/${id}`);
  return response.data;
};

export const createBanner = async (data: any) => {
  const response = await api.post('/banners', data);
  return response.data;
};

export const updateBanner = async (id: string, data: any) => {
  const response = await api.put(`/banners/${id}`, data);
  return response.data;
};

export const deleteBanner = async (id: string) => {
  const response = await api.delete(`/banners/${id}`);
  return response.data;
};

// Navigation
export const getNavigations = async () => {
  const response = await api.get('/navigation');
  return response.data;
};

export const getNavigationById = async (id: string) => {
  const response = await api.get(`/navigation/${id}`);
  return response.data;
};

export const createNavigation = async (data: any) => {
  const response = await api.post('/navigation', data);
  return response.data;
};

export const updateNavigation = async (id: string, data: any) => {
  const response = await api.put(`/navigation/${id}`, data);
  return response.data;
};

export const deleteNavigation = async (id: string) => {
  const response = await api.delete(`/navigation/${id}`);
  return response.data;
};

// Notifications
export const getNotifications = async (params?: { limit?: number; unreadOnly?: boolean }) => {
  try {
  const response = await api.get('/notifications', { params });
  return response.data;
  } catch (error: any) {
    // Return empty data structure if network error
    if (error.isNetworkError) {
      return { data: [], unreadCount: 0 };
    }
    throw error;
  }
};

export const getNotificationById = async (id: string) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  try {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
  } catch (error: any) {
    if (error.isNetworkError) {
      console.warn('Network error - unable to mark notification as read');
      return { success: false };
    }
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
  const response = await api.patch('/notifications/read-all');
  return response.data;
  } catch (error: any) {
    if (error.isNetworkError) {
      console.warn('Network error - unable to mark all notifications as read');
      return { success: false };
    }
    throw error;
  }
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const createNotification = async (data: {
  title: string;
  message: string;
  type?: 'order' | 'stock' | 'payment' | 'system' | 'other';
  relatedId?: string;
  relatedModel?: 'Order' | 'Product';
}) => {
  const response = await api.post('/notifications', data);
  return response.data;
};

// Upload – returns path (/uploads/xxx) for storing; use getUploadUrl(path) for img src
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await uploadApi.post('/upload/single', formData);
  return response.data.data.url;
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  const response = await uploadApi.post('/upload/multiple', formData);
  return response.data.data.map((item: any) => item.url);
};

// Authentication
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (data: { name: string; email: string; password: string; role?: 'admin' | 'customer' | 'shop_manager' }) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No token found');
  }
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Admin: list users (Settings > Admin Users)
export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

// Admin: update user (activate/deactivate, role)
export const updateUser = async (id: string, data: { isActive?: boolean; role?: 'admin' | 'customer' | 'shop_manager' }) => {
  const response = await api.patch(`/auth/users/${id}`, data);
  return response.data;
};

// Change password (Settings > Security)
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

// Settings (admin only)
export const getSiteSettings = async () => {
  const response = await api.get('/settings/site');
  return response.data;
};

export const updateSiteSettings = async (data: Record<string, any>) => {
  const response = await api.patch('/settings/site', data);
  return response.data;
};

export const getIntegrations = async () => {
  const response = await api.get('/settings/integrations');
  return response.data;
};

export const updateIntegration = async (id: string, data: { status?: 'connected' | 'disconnected'; apiKey?: string }) => {
  const response = await api.patch(`/settings/integrations/${id}`, data);
  return response.data;
};

export const getBackups = async () => {
  const response = await api.get('/settings/backups');
  return response.data;
};

export const createBackup = async () => {
  const response = await api.post('/settings/backups');
  return response.data;
};

// Product attributes (Settings > Product Attributes)
export const getProductAttributes = async (): Promise<{ success: boolean; data: ProductAttribute[] }> => {
  const response = await api.get('/settings/product-attributes');
  return response.data;
};

export const updateProductAttributes = async (attributes: ProductAttribute[]): Promise<{ success: boolean; data: ProductAttribute[] }> => {
  const response = await api.put('/settings/product-attributes', { attributes });
  return response.data;
};

export interface ProductAttribute {
  id: string;
  name: string;
  type: string;
  values: string[];
}

export default api;



