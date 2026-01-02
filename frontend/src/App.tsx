import { Routes, Route } from "react-router-dom";
import LandingPage from "./routes/LandingPage";
import LoginPage from "./routes/LoginPage";
import HomePage from "./routes/HomePage";
import ParcelWizard from "./routes/ParcelWizard";
import ParcelDetailPage from "./routes/ParcelDetailPage";

// Future pages
// import ParcelsPage from "./routes/ParcelsPage";
// import OwnershipPage from "./routes/OwnershipPage";
// import ReportsPage from "./routes/ReportsPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home/*" element={<HomePage />} />
      <Route path="/parcels/new" element={<ParcelWizard />} />
       <Route path="/parcels/:upin" element={<ParcelDetailPage />} /> 
      {/* Future routes */}
      {/* <Route path="/parcels" element={<ParcelsPage />} />
      <Route path="/ownership" element={<OwnershipPage />} />
      <Route path="/reports" element={<ReportsPage />} /> */}
    </Routes>
  );
};

export default App;
