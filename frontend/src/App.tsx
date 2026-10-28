import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { GuidedTour } from './components/GuidedTour';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewStudioPage } from './pages/ReviewStudioPage';
import { VaultPage } from './pages/VaultPage';
import { VisualAuditorPage } from './pages/VisualAuditorPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { InsightsPage } from './pages/InsightsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Routes>
        <Route element={<Layout onStartTour={() => { setTourStep(1); setTourOpen(true); }} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/studio" element={<ReviewStudioPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/visual" element={<VisualAuditorPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Floating Interactive Judge Tour */}
      {tourOpen && (
        <GuidedTour
          currentStep={tourStep}
          onNext={() => setTourStep((s) => Math.min(8, s + 1))}
          onPrev={() => setTourStep((s) => Math.max(1, s - 1))}
          onClose={() => setTourOpen(false)}
        />
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
