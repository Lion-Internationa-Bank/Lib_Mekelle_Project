import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ReportsLayout } from '../../components/reports/ReportsLayout';

// Import report pages
import { BillsReportPage } from './BillsReportPage';
import { EncumbrancesReportPage } from './EncumbrancesReportPage';
import { LandParcelsReportPage } from './LandParcelsReportPage';
import { OwnersMultipleParcelsPage } from './OwnersMultipleParcelsPage';
import { LeaseInstallmentRangePage } from './LeaseInstallmentRangePage';

// Simple home page that redirects to bills
const ReportsHomePage: React.FC = () => {
  return <Navigate to="/reports/bills" replace />;
};

// Main Reports Routes
export const ReportsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ReportsHomePage />} />
      <Route path="bills" element={<BillsReportPage />} />
      <Route path="encumbrances" element={<EncumbrancesReportPage />} />
      <Route path="parcels" element={<LandParcelsReportPage />} />
      <Route path="owners-multiple" element={<OwnersMultipleParcelsPage />} />
      <Route path="lease-installments" element={<LeaseInstallmentRangePage />} />
      <Route path="payments" element={
        <ReportsLayout title="Payments Report" description="Coming soon">
          <div className="p-8 text-center text-[#2a2718]/70">Payments Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="revenue" element={
        <ReportsLayout title="Revenue Analysis" description="Coming soon">
          <div className="p-8 text-center text-[#2a2718]/70">Revenue Report - Coming Soon</div>
        </ReportsLayout>
      } />
      <Route path="*" element={<Navigate to="/reports" replace />} />
    </Routes>
  );
};