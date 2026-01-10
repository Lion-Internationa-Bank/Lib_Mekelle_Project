// // HomePage.tsx
// import { useState, useEffect, useCallback } from "react";
// import { Navigate, Link } from "react-router-dom"; // Added Link
// import { useAuth } from "../auth/AuthContext";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
// import ParcelSearch from "../components/ParcelSearch";
// import ParcelTable from "../components/ParcelTable";
// import { fetchParcels } from "../services/api";
// import type { Parcel, Pagination } from "../services/api";

// const HomePage = () => {
//   const { user } = useAuth();
//   const [parcels, setParcels] = useState<Parcel[]>([]);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [currentFilters, setCurrentFilters] = useState({
//     page: 1,
//     limit: 20,
//     search: "",
//     sub_city: "",
//     ketena: "",
//     tenure_type: "",
//     land_use: "",
//   });

//   const fetchData = useCallback(async (filters: typeof currentFilters) => {
//     try {
//       setLoading(true);
//       setError("");
//       const response = await fetchParcels(filters);

//       if (response.success) {
//         setParcels(response.data.parcels);
//         setPagination(response.data.pagination);
//       } else {
//         setError("API returned error response");
//       }
//     } catch (err) {
//       setError("Failed to load parcels. Check if backend is running on localhost:5000");
//       console.error("API Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const handleSearch = useCallback(
//     (newFilters: {
//       search: string;
//       sub_city: string;
//       ketena: string;
//       tenure_type: string;
//       land_use: string;
//     }) => {
//       setCurrentFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
//     },
//     []
//   );

//   const handlePageChange = (page: number) => {
//     setCurrentFilters((prev) => ({ ...prev, page }));
//   };

//   const clearFilters = () => {
//     const clearedFilters = {
//       page: 1,
//       limit: 20,
//       search: "",
//       sub_city: "",
//       ketena: "",
//       tenure_type: "",
//       land_use: "",
//     };
//     setCurrentFilters(clearedFilters);
//   };

//   useEffect(() => {
//     fetchData(currentFilters);
//   }, [currentFilters, fetchData]);

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       <Header />

//       <div className="flex">
//         {/* Sidebar */}
//         <div
//           className={`lg:w-64 lg:flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform lg:translate-x-0 ${
//             isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//           } lg:block`}
//         >
//           <Sidebar />
//         </div>

//         {/* Mobile Overlay */}
//         {isSidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
//             onClick={() => setIsSidebarOpen(false)}
//           />
//         )}

//         {/* Main Content */}
//         <main className="flex-1 lg:ml-0 pt-4 lg:pt-0 px-6 lg:px-8 pb-12 lg:pb-16 min-h-screen overflow-auto">
//           <div className="max-w-7xl mx-auto space-y-8">
//             {/* Quick Action Cards */}
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 m-16">
//               <Link
//                 to="/parcels/new"
//                 className="group bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center h-full"
//               >
//                 <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
//                   <span className="text-3xl">Add</span>
//                 </div>
//                 <h3 className="text-2xl font-bold mb-2">Add Land Parcel</h3>
//                 <p className="opacity-90 text-sm">Register new parcel</p>
//               </Link>

//               <Link
//                 to="/owners/new"
//                 className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center h-full"
//               >
//                 <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
//                   <span className="text-3xl">Person</span>
//                 </div>
//                 <h3 className="text-2xl font-bold mb-2">Add Owner</h3>
//                 <p className="opacity-90 text-sm">Register new owner</p>
//               </Link>

//               <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-500 to-slate-600 text-white p-8 rounded-3xl shadow-2xl flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="text-4xl font-bold">
//                     {pagination?.total?.toLocaleString() || "0"}
//                   </div>
//                   <div className="text-slate-100 text-sm font-medium">
//                     Total Parcels
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Search & Filter */}
//             <ParcelSearch onSearch={handleSearch} />

//             {/* Parcels Table */}
//             <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
//               {/* Loading */}
//               {loading && (
//                 <div className="p-16 text-center">
//                   <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
//                   <p className="text-xl font-semibold text-gray-700">
//                     Loading parcels...
//                   </p>
//                   <p className="text-gray-500 mt-2">Connecting to backend API</p>
//                 </div>
//               )}

//               {/* Error */}
//               {error && !loading && (
//                 <div className="p-16 text-center border-t border-gray-200 bg-red-50/50">
//                   <div className="text-6xl mb-6">Warning</div>
//                   <h3 className="text-2xl font-bold text-red-800 mb-4">{error}</h3>
//                   <button
//                     onClick={() => fetchData(currentFilters)}
//                     className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
//                   >
//                     <span>Refresh</span>
//                     Retry Load
//                   </button>
//                 </div>
//               )}

//               {/* Empty State */}
//               {!loading && !error && parcels.length === 0 && (
//                 <div className="p-16 text-center border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
//                   <span className="text-7xl mb-8 block animate-bounce">Empty Mailbox</span>
//                   <h3 className="text-3xl font-bold text-gray-800 mb-4">
//                     No parcels found
//                   </h3>
//                   <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
//                     Try adjusting your search filters or add your first land parcel
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//                     <button
//                       onClick={clearFilters}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
//                     >
//                       Clear All Filters
//                     </button>
//                     <Link
//                       to="/parcels/new"
//                       className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
//                     >
//                       <span>Add</span>
//                       Add First Parcel
//                     </Link>
//                   </div>
//                 </div>
//               )}

//               {/* Table Content */}
//               {!loading && !error && parcels.length > 0 && (
//                 <ParcelTable parcels={parcels} />
//               )}
//             </div>

//             {/* Pagination */}
//             {pagination && parcels.length > 0 && (
//               <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
//                 <div className="text-sm text-gray-600 mb-4 sm:mb-0">
//                   Showing{" "}
//                   <span className="font-semibold text-gray-900">
//                     {(currentFilters.page - 1) * currentFilters.limit + 1}
//                   </span>{" "}
//                   to{" "}
//                   <span className="font-semibold text-gray-900">
//                     {Math.min(
//                       currentFilters.page * currentFilters.limit,
//                       pagination.total
//                     )}
//                   </span>{" "}
//                   of{" "}
//                   <span className="font-semibold text-gray-900">
//                     {pagination.total.toLocaleString()}
//                   </span>{" "}
//                   parcels
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => handlePageChange(currentFilters.page - 1)}
//                     disabled={!pagination.hasPrev || loading}
//                     className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 19l-7-7 7-7"
//                       />
//                     </svg>
//                     Previous
//                   </button>

//                   <span className="px-6 py-3 text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl shadow-sm min-w-[140px] text-center">
//                     Page {currentFilters.page} of {pagination.totalPages}
//                   </span>

//                   <button
//                     onClick={() => handlePageChange(currentFilters.page + 1)}
//                     disabled={!pagination.hasNext || loading}
//                     className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     Next
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 5l7 7-7 7"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default HomePage;