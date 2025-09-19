// MainBar.tsx
import { Search, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const MainBar: React.FC = () => {
    const { goHome, goToLogin, goToRegister, isLoginPage, goToUserInfo, gotoUserCenter } = useAppNavigation();
    const { isAuthenticated, user } = useUser();


  return (
    <div className="bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
                {/* Z2U Logo (mock) */}
                <div className="flex-shrink-0">
                    <button 
                        onClick={goHome}
                        className="text-2xl font-extrabold text-gray-800 tracking-tight hover:text-blue-600 transition-colors duration-200 ease-in-out"
                    >
                        Z2U
                    </button>
                </div>

                {/* Search Bar: Hidden on small screens, visible from medium screens up. */}
                <div className="flex-grow max-w-xl mx-4 hidden md:block">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 w-5 h-5 text-gray-400" /> {/* Search icon */}
                        <input
                            type="text"
                            placeholder="Search for games, items, etc."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm"
                        />
                    </div>
                </div>

                {/* Action Buttons: Login, Register, Cart, Messages. Login/Register hidden on extra small screens. */}
                <div className="flex items-center space-x-6 flex-shrink-0 text-gray-700">
                    {isAuthenticated ? (
                        <button
                            onClick={gotoUserCenter}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
                        >
                            <User className="w-5 h-5" />
                            <span>{user?.displayName || 'User'}</span>
                        </button>
                    ) : (
                        !isLoginPage() ? (
                            <button 
                                onClick={goToLogin}
                                className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
                            >
                                <User className="w-5 h-5" />
                                <span>Login</span>
                            </button>
                        ) : (
                            <button 
                                onClick={goToRegister}
                                className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
                            >
                                <User className="w-5 h-5" />
                                <span>Register</span>
                            </button>
                        )
                    )}

                </div>
            </div>
  );
};

export default MainBar;
