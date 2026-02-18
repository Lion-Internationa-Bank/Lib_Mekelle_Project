// src/routes/reports/index.tsx
import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReportsLayout } from '../../components/reports/ReportsLayout';
import { BillsReportPage } from './BillsReportPage';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'bills',
    title: 'Bills Report',
    description: 'View and download bills with filtering by subcity, status, and date range',
    icon: '💰',
    path: '/reports/bills',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'payments',
    title: 'Payments Report',
    description: 'Track all payments made across different time periods',
    icon: '💳',
    path: '/reports/payments',
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'parcels',
    title: 'Parcels Report',
    description: 'Comprehensive report on land parcels and their status',
    icon: '🏞️',
    path: '/reports/parcels',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'owners',
    title: 'Owners Report',
    description: 'Property owners information and their holdings',
    icon: '👥',
    path: '/reports/owners',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'leases',
    title: 'Leases Report',
    description: 'Active and expired lease agreements overview',
    icon: '📄',
    path: '/reports/leases',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'revenue',
    title: 'Revenue Analysis',
    description: 'Detailed revenue analysis and trends',
    icon: '📈',
    path: '/reports/revenue',
    color: 'bg-pink-50 text-pink-600',
  },
];

// Define which reports are visible for each role
const reportVisibilityByRole: Record<string, string[]> = {
  CITY_ADMIN: ['bills', 'payments', 'parcels', 'owners', 'leases', 'revenue'],
  REVENUE_ADMIN: ['bills', 'payments', 'revenue'],
  SUBCITY_ADMIN: ['bills', 'parcels', 'owners', 'leases'],
  SUBCITY_NORMAL: [],
  SUBCITY_AUDITOR: [],
  REVENUE_USER: [],
};

// Reports Home Page
export const ReportsHomePage: React.FC = () => {
  const { user } = useAuth();

  const visibleReports = reportCards.filter(report => 
    user?.role && (reportVisibilityByRole[user.role]?.includes(report.id) || false)
  );

  return (
    <ReportsLayout title="Reports Dashboard" description="Select a report to view or download">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {visibleReports.map((report) => (
          <Link key={report.id} to={report.path} className="block">
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-lg ${report.color} mb-4`}>
                  <span className="text-2xl">{report.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ReportsLayout>
  );
};

// Main Reports Routes
export const ReportsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ReportsHomePage />} />
      <Route path="bills" element={<BillsReportPage />} />
      <Route path="payments" element={
        <ReportsLayout title="Payments Report" description="Coming soon">
          <div className="p-8 text-center text-gray-500">Payments Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="parcels" element={
        <ReportsLayout title="Parcels Report" description="Coming soon">
          <div className="p-8 text-center text-gray-500">Parcels Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="owners" element={
        <ReportsLayout title="Owners Report" description="Coming soon">
          <div className="p-8 text-center text-gray-500">Owners Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="leases" element={
        <ReportsLayout title="Leases Report" description="Coming soon">
          <div className="p-8 text-center text-gray-500">Leases Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="revenue" element={
        <ReportsLayout title="Revenue Analysis" description="Coming soon">
          <div className="p-8 text-center text-gray-500">Revenue Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="*" element={<Navigate to="/reports" replace />} />
    </Routes>
  );
};