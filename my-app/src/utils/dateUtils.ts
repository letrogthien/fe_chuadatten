/**
 * Safely format date string to Vietnamese format
 * @param dateString - Date string to format
 * @returns Formatted date string or fallback message
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'Không có dữ liệu';
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Safely format currency to Vietnamese format
 * @param amount - Amount to format
 * @returns Formatted currency string or fallback message
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format date to short format (without time)
 * @param dateString - Date string to format
 * @returns Formatted date string or fallback message
 */
export const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'Không có dữ liệu';
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};