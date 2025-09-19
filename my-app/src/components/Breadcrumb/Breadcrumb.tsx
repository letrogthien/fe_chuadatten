import { ChevronRight, Home } from 'lucide-react';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS } from '../../constants/routes';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Always start with home
  breadcrumbItems.push({
    path: ROUTES.HOME,
    label: 'Home'
  });

  // Add current path if not home
  if (location.pathname !== ROUTES.HOME) {
    const currentRoute = location.pathname as keyof typeof ROUTE_LABELS;
    const label = ROUTE_LABELS[currentRoute] || pathSegments[pathSegments.length - 1];
    
    breadcrumbItems.push({
      path: location.pathname,
      label: label
    });
  }

  // Don't show breadcrumb for home page only
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex h-fit items-center space-x-2 text-sm text-gray-600 py-3 px-4 bg-gray-50 border-b">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === 0 && <Home className="w-4 h-4" />}
          
          {index < breadcrumbItems.length - 1 ? (
            <NavLink
              to={item.path}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {item.label}
            </NavLink>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
          
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
