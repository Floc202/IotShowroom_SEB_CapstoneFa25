import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister?: () => void;
  onBackToHome?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onRegister, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!');
    }
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Back to Homepage Button */}
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Homepage
              </button>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại</h1>
              <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống IoT Projects</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-3">🎯 Tài khoản Demo:</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleQuickLogin('admin@iot.edu', 'admin123')}
                  className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">👔 Admin</p>
                  <p className="text-xs text-gray-600">admin@iot.edu / admin123</p>
                </button>
                <button
                  onClick={() => handleQuickLogin('instructor@iot.edu', 'instructor123')}
                  className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">👨‍🏫 Giảng viên</p>
                  <p className="text-xs text-gray-600">instructor@iot.edu / instructor123</p>
                </button>
                <button
                  onClick={() => handleQuickLogin('student@iot.edu', 'student123')}
                  className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">🎓 Sinh viên</p>
                  <p className="text-xs text-gray-600">student@iot.edu / student123</p>
                </button>
              </div>
            </div>
          </div>

          {/* Register Link */}
          {onRegister && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  onClick={onRegister}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginForm;