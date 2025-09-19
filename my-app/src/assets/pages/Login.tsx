import { Eye, EyeOff, Lock, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { components } from '../../api-types/userService';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import TwoFA from './TwoFA';

const Login: React.FC = () => {
  const { goToRegister } = useAppNavigation();
  const { goToForgotPassword } = useAppNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<components['schemas']['LoginRequest']>({
    username: '',
    password: '',
    deviceName: String(window.navigator.userAgent || 'web').substring(0,50),
    deviceType: 'web',
  });
  const { login, error: userError, loading: userLoading, isAuthenticated } = useUser();
  const [pending2FA, setPending2FA] = useState(false);
  const [tmpToken, setTmpToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { goHome } = useAppNavigation();

  React.useEffect(() => {
    if (isAuthenticated) {
      // Check for return URL after login
      const returnUrl = localStorage.getItem('returnAfterLogin');
      if (returnUrl) {
        localStorage.removeItem('returnAfterLogin');
        navigate(returnUrl);
      } else if (location.state?.from) {
        navigate(location.state.from);
      } else {
        goHome();
      }
    }
  }, [isAuthenticated, goHome, navigate, location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ...existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await import('../../services/apiClient').then(m => m.default.post('/api/v1/user-service/auth/login', formData));
      if (res.data?.message === 'Two-factor authentication required') {
        setPending2FA(true);
        setTmpToken(res.data.data?.accessToken || null);
        return;
      }
      if (res.data?.message !== 'Login successful') {
        setLoginError(res.data.message || 'Login failed');
        return;
      }
      // Cookie được set, gọi lại /auth/me và /users/id/{userId}
      await login(formData);
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Login failed');
    }
  };




  return (
    <section className="py-4 bg-gray-50 h-screen flex items-center justify-center">
      {pending2FA && tmpToken ? (
        <TwoFA
          tmpToken={tmpToken}
          onSuccess={() => {
            setPending2FA(false);
            setTmpToken(null);
            // Không gọi lại login, chỉ reload ở TwoFA
          }}
        />
      ) : (
        <div className="w-full flex items-center justify-center">
          <div className="max-w-md w-full flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full flex flex-col items-center justify-center">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to access your account</p>
                {location.state?.message && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">{location.state.message}</p>
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 w-full">
                {/* Hiển thị lỗi nếu có */}
                {(userError || loginError) && (
                  <div className="text-red-500 text-sm text-center mb-2">{userError || loginError}</div>
                )}
                {/* Username Input */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button type="button" onClick={goToForgotPassword} className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>
                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                  disabled={userLoading}
                >
                  {userLoading ? 'Signing In...' : 'Sign In'}
                </button>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={goToRegister}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Login;
