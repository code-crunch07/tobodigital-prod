import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const publicApi = axios.create({
  baseURL: `${API_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public Products
export const getPublicProducts = async (params?: any) => {
  const response = await publicApi.get('/products', { params });
  return response.data;
};

export const getPublicProductById = async (id: string) => {
  const response = await publicApi.get(`/products/${id}`);
  return response.data;
};

// Public Categories
export const getPublicCategories = async () => {
  const response = await publicApi.get('/categories');
  return response.data;
};

export default publicApi;
