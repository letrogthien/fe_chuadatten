import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS } from '../../constants/routes';

interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: ROUTES.HOME,
    label: ROUTE_LABELS[ROUTES.HOME],
    icon: '🏠'
  },
  {
    path: ROUTES.CURRENCY,
    label: ROUTE_LABELS[ROUTES.CURRENCY],
    icon: '🪙'
  },
  {
    path: ROUTES.ITEMS,
    label: ROUTE_LABELS[ROUTES.ITEMS],
    icon: '🧿'
  },
  {
    path: ROUTES.ACCOUNTS,
    label: ROUTE_LABELS[ROUTES.ACCOUNTS],
    icon: '🌌'
  },
  {
    path: ROUTES.GIFT_CARDS,
    label: ROUTE_LABELS[ROUTES.GIFT_CARDS],
    icon: '🎁'
  },
];

interface NavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = '', 
  orientation = 'horizontal' 
}) => {
  const baseClasses = orientation === 'horizontal' 
    ? 'flex items-center space-x-6' 
    : 'flex flex-col space-y-2';

  return (
    <nav className={`${baseClasses} ${className}`}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`
          }
        >
          {item.icon && <span className="text-lg">{item.icon}</span>}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
