// src/pages/ParcelDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import { fetchParcelDetail, type ParcelDetail } from "../services/parcelDetailApi";

import ParcelDetailHeader from "../components/parcelDetail/ParcelDetailHeader";
import ParcelDetailTabs from "../components/parcelDetail/ParcelDetailTabs";
import ParcelInfoSection from "../components/parcelDetail/sections/ParcelInfoSection";
import OwnersSection from "../components/parcelDetail/sections/OwnersSection";
import LeaseSection from "../components/parcelDetail/sections/LeaseSection";
import EncumbrancesSection from "../components/parcelDetail/sections/EncumbrancesSection";
import BuildingsSection from "../components/parcelDetail/sections/BuildingsSection";
import DangerZone from "../components/parcelDetail/DangerZone";
import DocumentList from "../components/parcelDetail/DocumentList";
import BillingSection from "../components/parcelDetail/sections/BillingSection";
import TransferHistorySection from "../components/parcelDetail/sections/TransferHistorySection";


type DetailTab = "parcel" | "lease" | "encumbrances" |"history" | "buildings" | "billing";

const ParcelDetailPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { upin } = useParams<{ upin: string }>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState<DetailTab>("parcel");
  const [data, setData] = useState<ParcelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!upin) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchParcelDetail(upin);
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to load parcel detail");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [upin]);

  const reload = async () => {
    if (!upin) return;
    try {
      const res = await fetchParcelDetail(upin);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error("Reload failed:", err);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-red-800 font-semibold">{error || "Parcel not found"}</p>
            <Link to="/home" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`lg:w-64 fixed lg:static inset-y-0 left-0 z-40 transform transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <ParcelDetailHeader data={data} />

            <ParcelDetailTabs tab={tab} setTab={setTab} />

            <div className="mt-8 space-y-12">
              {/* Parcel Tab */}
              {tab === "parcel" && (
                <>
                  <ParcelInfoSection parcel={data} onReload={reload} />
                  <OwnersSection parcel={data} onReload={reload} />

                  {/* Parcel-level Documents */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Parcel Documents</h2>
                    <DocumentList documents={data.documents} />
                  </div>

                  <DangerZone upin={data.upin} onDeleted={() => navigate("/home")} />
                </>
              )}

              {/* Lease Tab */}
              {tab === "lease" && data.lease_agreement && (
                <LeaseSection lease={data.lease_agreement} onReload={reload} />
              )}

              {tab === "lease" && !data.lease_agreement && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-lg">No lease agreement registered</p>
                </div>
              )}

              {/* Encumbrances Tab */}
              {tab === "encumbrances" && (
                <EncumbrancesSection
                  encumbrances={data.encumbrances}
                  upin={data.upin}
                  onReload={reload}
                />
              )}
            
            {/* Transfer History Tab */}
              {tab === "history" && (
                <TransferHistorySection
                  history={data.history}
                  upin={data.upin}
                  onReload={reload}
                />
              )}

              {/* Buildings Tab */}
              {tab === "buildings" && (
                <BuildingsSection buildings={data.buildings} />
              )}

              {/* Billing Tab */}
              {tab === "billing" && (
                <BillingSection billingRecords={data.billing_records} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParcelDetailPage;