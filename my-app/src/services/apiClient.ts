// API client sử dụng baseURL và cấu hình từ openapi-typescript/orval
import axios from 'axios';

const baseURL = 'http://localhost:3000'; // Thay bằng baseURL sinh ra từ tool openapi-typescript/orval

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
