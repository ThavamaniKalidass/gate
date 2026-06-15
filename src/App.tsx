import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { GatePassPage } from "./pages/GatePassPage";
import { PrintHistoryPage } from "./pages/PrintHistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SharedGatePassPage } from "./pages/SharedGatePassPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/shared" element={<SharedGatePassPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/gate-pass" element={<GatePassPage />} />
          <Route path="/history" element={<PrintHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
