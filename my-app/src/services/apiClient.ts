// API client sử dụng baseURL và cấu hình từ openapi-typescript/orval
import axios from 'axios';

export const DOMAIN = import.meta.env.VITE_API_DOMAIN || 'https://auth.wezd.io.vn';

const apiClient = axios.create({
  baseURL: DOMAIN,
  withCredentials: true, // Thêm dòng này
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;