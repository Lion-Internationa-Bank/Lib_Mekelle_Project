// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/Sidebar';
import { CalendarProvider } from '../contexts/CalendarContext';
import { useState } from 'react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <CalendarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header - always on top */}
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`lg:w-64 lg:flex-shrink-0 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } lg:block`}
        >
          <Sidebar />
        </div>

        {/* Mobile overlay when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto pt-4 lg:pt-0 px-6 lg:px-8 pb-12 lg:pb-16">
          <Outlet /> {/* This renders the child route component */}
        </main>
      </div>
    </div>
    </CalendarProvider>
  );
};

export default MainLayout;