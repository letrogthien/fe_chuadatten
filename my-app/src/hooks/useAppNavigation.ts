import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, type RoutePath } from '../constants/routes';

/**
 * Custom hook for navigation management
 * Provides type-safe navigation methods and current route information
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a specific route with type safety
   */
  const navigateTo = (route: RoutePath) => {
    navigate(route);
  };

  /**
   * Go back to previous page
   */
  const goBack = () => {
    navigate(-1);
  };

  /**
   * Go forward to next page
   */
  const goForward = () => {
    navigate(1);
  };

  /**
   * Navigate to home page
   */
  const goHome = () => {
    navigate(ROUTES.HOME);
  };

  /**
   * Navigate to login page
   */
  const goToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  /**
   * Navigate to register page
   */
  const goToRegister = () => {
    navigate(ROUTES.REGISTER);
  };
  
  /**
   * Navigate to forgot password page
   */
  const goToForgotPassword = () => {
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  /**
   * Check if current route matches the given route
  /**
   * Navigate to user info page
   */
  const goToUserInfo = () => {
    navigate(ROUTES.USER_INFO);
  };
  
  const isCurrentRoute = (route: RoutePath): boolean => {
    return location.pathname === route;
  };

  /**
   * Check if user is on login page
   */
  const isLoginPage = (): boolean => {
    return isCurrentRoute(ROUTES.LOGIN);
  };

  /**
   * Check if user is on home page
   */
  const isHomePage = (): boolean => {
    return isCurrentRoute(ROUTES.HOME);
  };

  /**
   * Navigate to user center page
   */
  const gotoUserCenter = () => {
    navigate(ROUTES.USER_CENTER);
  }

  return {
    // Navigation methods
    navigateTo,
    goBack,
    goForward,
    goHome,
    goToLogin,
    goToRegister,
    goToForgotPassword,
    
    // Route checking methods
    isCurrentRoute,
    goToUserInfo,
    gotoUserCenter,

    isLoginPage,
    isHomePage,
    
    // Current location info
    currentPath: location.pathname,
    location,
  };
};

export default useAppNavigation;
