// src/routes/LoginPage.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LandingPage = () => {
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
    <div className="min-h-screen bg-linear-to-br from-[#1a1a1a] via-[#2a2718] to-[#f0cd6e] flex items-center justify-center p-4 lg:p-6">
      {/* Main Container - Balanced proportions */}
      <div className="max-w-5xl w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side - Landing Content - Balanced */}
          <div className="lg:w-1/2 bg-linear-to-br from-[#2a2718]/90 to-[#a68f4e]/90 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f0cd6e]/10 rounded-full blur-3xl"></div>
            
            {/* Logo and Brand - Condensed for balance */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-linear-to-r from-[#f0cd6e] to-[#a68f4e] rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                ML
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Mekelle Land 
                <span className="block text-[#f0cd6e]">Management</span>
              </h1>
              
              <p className="text-white/80 text-base mb-8 leading-relaxed max-w-md">
                An integrated digital platform for managing Mekelle City land records, property ownership, and land administration services.
              </p>
            </div>

            {/* Features List - Condensed */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-5 h-5 text-[#f0cd6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Secure Land Records</h3>
                  <p className="text-white/60 text-xs">Blockchain-backed documentation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-5 h-5 text-[#f0cd6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Property Valuation</h3>
                  <p className="text-white/60 text-xs">Real-time market analysis</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-5 h-5 text-[#f0cd6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Citizen Services</h3>
                  <p className="text-white/60 text-xs">24/7 online assistance</p>
                </div>
              </div>
            </div>

            {/* Stats - Condensed */}
            <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <div>
                <div className="text-xl font-bold text-white">15K+</div>
                <div className="text-white/60 text-xs">Properties</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-white/60 text-xs">Satisfaction</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">24/7</div>
                <div className="text-white/60 text-xs">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form - Balanced */}
          <div className="lg:w-1/2 bg-white/95 backdrop-blur-xl p-8 lg:p-10 flex items-center">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#2a2718] mb-1">Welcome Back</h2>
                <p className="text-[#2a2718]/60 text-sm">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#2a2718] mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#a68f4e] focus:border-transparent transition-all duration-200 bg-white/50 text-sm"
                    disabled={loading}
                    required
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2a2718] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#f0cd6e] rounded-xl focus:ring-2 focus:ring-[#a68f4e] focus:border-transparent transition-all duration-200 bg-white/50 pr-10 text-sm"
                      disabled={loading}
                      required
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6d5f35] hover:text-[#2a2718] focus:outline-none"
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-[#a68f4e] to-[#6d5f35] hover:from-[#6d5f35] hover:to-[#2a2718] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;