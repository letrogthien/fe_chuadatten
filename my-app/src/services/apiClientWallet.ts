import axios from 'axios';

export const DOMAIN = import.meta.env.VITE_API_DOMAIN || 'https://pay.wezd.io.vn';

const apiClient = axios.create({
  baseURL: DOMAIN,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;