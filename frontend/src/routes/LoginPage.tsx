
// src/routes/LoginPage.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
// import {toast } from 'sonner';
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password);

    setLoading(false);
    if (success) {
     
      navigate('/home');
    } else {
      setError('Invalid username or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2718] via-[#f0cd6e]/20 to-[#a68f4e]/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-r from-[#a68f4e] to-[#6d5f35] rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-6">
            ML
          </div>
          <h2 className="text-3xl font-bold text-[#2a2718] mb-2">Welcome Back</h2>
          <p className="text-[#2a2718]/70">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#2a2718] mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#a68f4e] focus:border-transparent transition-all duration-200 bg-white/50"
              disabled={loading}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-[#2a2718] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#a68f4e] focus:border-transparent transition-all duration-200 bg-white/50 pr-12"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6d5f35] hover:text-[#2a2718] focus:outline-none focus:ring-2 focus:ring-[#a68f4e] focus:ring-opacity-50 rounded-lg p-1"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#a68f4e] to-[#6d5f35] hover:from-[#6d5f35] hover:to-[#2a2718] text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      
      </div>
    </div>
  );
};

export default LoginPage;
