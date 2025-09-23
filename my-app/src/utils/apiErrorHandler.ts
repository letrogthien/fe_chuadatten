export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status || 500,
      code: (error as any).code || 'UNKNOWN_ERROR'
    };
  }
  
  return {
    message: 'Đã xảy ra lỗi không xác định',
    status: 500,
    code: 'UNKNOWN_ERROR'
  };
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  
  // Map common error codes to user-friendly messages
  switch (apiError.code) {
    case 'NETWORK_ERROR':
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
    case 'UNAUTHORIZED':
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 'FORBIDDEN':
      return 'Truy cập bị từ chối.';
    case 'NOT_FOUND':
      return 'Không tìm thấy dữ liệu yêu cầu.';
    case 'VALIDATION_ERROR':
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    case 'SERVER_ERROR':
      return 'Lỗi server. Vui lòng thử lại sau.';
    default:
      return apiError.message || 'Đã xảy ra lỗi không xác định';
  }
};