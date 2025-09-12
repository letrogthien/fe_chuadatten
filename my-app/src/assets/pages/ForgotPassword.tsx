import { Mail } from 'lucide-react';
import React, { useState } from 'react';
import type { components } from '../../api-types/userService';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import apiClient from '../../services/apiClient';

const ForgotPassword: React.FC = () => {
  const { goToLogin } = useAppNavigation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // ...existing code...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    setError('');
  // ...existing code...
    try {
      const payload: components['schemas']['ForgotPwdRequest'] = { email };
      await apiClient.post<components['schemas']['ApiResponseString']>('/api/v1/user-service/auth/forgot-password', payload);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Request failed');
    } finally {
      // ...existing code...
    }
  };

  return (
  <section className="py-4 bg-gray-50 flex-1 min-h-screen items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 w-full items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
              <p className="text-gray-600">Enter your email to reset your password</p>
            </div>
            {submitted ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold mb-4">If your email exists, a reset link has been sent!</p>
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Send Reset Link
                </button>
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
