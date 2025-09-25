// API client sử dụng baseURL và cấu hình từ openapi-typescript/orval
import axios from 'axios';

export const DOMAIN = import.meta.env.VITE_API_DOMAIN || 'https://product.wezd.io.vn';

const apiClient = axios.create({
  baseURL: DOMAIN,
  withCredentials: true, // Thêm dòng này
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;


// Product Service Client
export const productServiceClient = axios.create({
  baseURL: `${DOMAIN}/api/v1/product-service`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});