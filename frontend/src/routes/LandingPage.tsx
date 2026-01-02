import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
    <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/50">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-8 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
        ML
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
        Mekele Land Management
      </h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Digital platform for managing land parcels, ownership, and city administration services.
      </p>
      <Link
        to="/login"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        Get Started
      </Link>
    </div>
  </div>
);

export default LandingPage;
