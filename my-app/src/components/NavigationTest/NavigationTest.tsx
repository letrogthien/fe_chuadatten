import React from 'react';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const NavigationTest: React.FC = () => {
  const { goToLogin, goToRegister, goHome, currentPath } = useAppNavigation();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Navigation Test</h3>
      <p className="text-sm text-gray-600 mb-4">Current path: {currentPath}</p>
      
      <div className="space-y-3">
        <button
          onClick={goHome}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Home
        </button>
        
        <button
          onClick={goToLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Login
        </button>
        
        <button
          onClick={goToRegister}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Register
        </button>
      </div>
    </div>
  );
};

export default NavigationTest;
