// Route constants for better maintainability
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  USER_INFO: '/user-info',
  USER_CENTER: '/user-center',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PAYMENT: '/payment',
  VNPAY_RETURN: '/vnpay-return',
  ORDER_HISTORY: '/order-history',
  ORDER_DETAIL: '/order-detail',
  PRODUCTS: '/products',
  CURRENCY: '/currency',
  ITEMS: '/items',
  ACCOUNTS: '/accounts',
  GIFT_CARDS: '/gift-cards',
} as const;

// Route labels for navigation
export const ROUTE_LABELS = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.FORGOT_PASSWORD]: 'Forgot Password',
  [ROUTES.USER_INFO]: 'User Info',
  [ROUTES.USER_CENTER]: 'User Center',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.CART]: 'Cart',
  [ROUTES.CHECKOUT]: 'Checkout',
  [ROUTES.PAYMENT]: 'Payment',
  [ROUTES.VNPAY_RETURN]: 'VNPay Return',
  [ROUTES.ORDER_HISTORY]: 'Order History',
  [ROUTES.ORDER_DETAIL]: 'Order Detail',
  [ROUTES.PRODUCTS]: 'Products',
  [ROUTES.CURRENCY]: 'Currency',
  [ROUTES.ITEMS]: 'Items',
  [ROUTES.ACCOUNTS]: 'Accounts',
  [ROUTES.GIFT_CARDS]: 'Gift Cards',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
