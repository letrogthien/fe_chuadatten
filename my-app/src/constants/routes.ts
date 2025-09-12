// Route constants for better maintainability
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  CART: '/cart',
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
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.CART]: 'Cart',
  [ROUTES.CURRENCY]: 'Currency',
  [ROUTES.ITEMS]: 'Items',
  [ROUTES.ACCOUNTS]: 'Accounts',
  [ROUTES.GIFT_CARDS]: 'Gift Cards',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
