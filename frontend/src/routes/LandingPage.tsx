import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-linear-to-br from-[#2a2718] to-[#f0cd6e] flex items-center justify-center p-8">
    <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/50">
      <div className="w-24 h-24 bg-linear-to-r from-[#a68f4e] to-[#6d5f35] rounded-2xl mx-auto mb-8 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
        ML      </div>
      <h1 className="text-4xl font-bold bg-linear-to-r from-[#2a2718] to-[#6d5f35] bg-clip-text text-transparent mb-4">
        Mekelle Land Management
      </h1>
      <p className="text-lg text-[#2a2718]/70 mb-8 leading-relaxed">
        An integrated digital platform for managing Mekelle City land records, property ownership, and land administration services.
      </p>
      <Link
        to="/login"
        className="inline-block bg-[#a68f4e] hover:bg-[#6d5f35] text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        Get Started
      </Link>
    </div>
  </div>
);

export default LandingPage;
