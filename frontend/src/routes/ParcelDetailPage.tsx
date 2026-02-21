// src/routes/ParcelDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

type DetailTab = "parcel" | "lease" | "encumbrances" | "history" | "buildings" | "billing";


const ParcelDetailPage = () => {
  const { user } = useAuth();
  const isSubcityNormal = user?.role === "SUBCITY_NORMAL";
  const navigate = useNavigate();
  const { upin } = useParams<{ upin: string }>();

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

    if (!user) {

    console.warn(
      `[AuthGuard] No user found at ${new Date().toLocaleTimeString()}. Redirecting to /login...`
    );
    return <Navigate to="/login" replace />;
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f0cd6e]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200 max-w-md">
          <p className="text-red-800 font-semibold text-lg mb-4">
            {error || "Parcel not found"}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-6 py-3 bg-[#f0cd6e] text-[#2a2718] rounded-xl hover:bg-[#2a2718] hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-6">
      {/* Header Section */}
      <ParcelDetailHeader data={data} />

      {/* Tabs Navigation */}
      <ParcelDetailTabs tab={tab} setTab={setTab} />

      {/* Tab Content */}
      <div className="space-y-12">
        {/* Parcel Tab */}
        {tab === "parcel" && (
          <>
            <ParcelInfoSection parcel={data} onReload={reload} />
            <OwnersSection parcel={data} onReload={reload} />

            {/* Parcel-level Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#f0cd6e] p-8">
              <h2 className="text-xl font-semibold text-[#2a2718] mb-6">Parcel Documents</h2>
              <DocumentList documents={data.documents} />
            </div>
            { isSubcityNormal &&
            ( <DangerZone upin={data.upin} onDeleted={() => navigate("/home")} />)
            }

         
          </>
        )}

        {/* Lease Tab */}
      
{ tab === "lease" && data.tenure_type == "LEASE" && (
  <LeaseSection
    parcel={data}
    lease={data.lease_agreement}
    onReload={reload}
  />
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
          <BillingSection data={data} />
        )}
      </div>
    </div>
  );
};

export default ParcelDetailPage;