import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleGate } from "./auth/RoleGate";
import { useAuth } from "./auth/AuthProvider";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

const DeveloperDashboard = lazy(() =>
  import("./pages/DeveloperDashboard").then((module) => ({ default: module.DeveloperDashboard }))
);
const BusinessDashboard = lazy(() =>
  import("./pages/BusinessDashboard").then((module) => ({ default: module.BusinessDashboard }))
);
const CreatorDashboard = lazy(() =>
  import("./pages/CreatorDashboard").then((module) => ({ default: module.CreatorDashboard }))
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy").then((module) => ({ default: module.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
  import("./pages/TermsOfService").then((module) => ({ default: module.TermsOfService }))
);
const Integrations = lazy(() =>
  import("./pages/Integrations").then((module) => ({ default: module.Integrations }))
);
const Automations = lazy(() =>
  import("./pages/Automations").then((module) => ({ default: module.Automations }))
);
const Solutions = lazy(() =>
  import("./pages/Solutions").then((module) => ({ default: module.Solutions }))
);
const Pricing = lazy(() =>
  import("./pages/Pricing").then((module) => ({ default: module.Pricing }))
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((module) => ({ default: module.NotFound }))
);
const OAuthCallback = lazy(() =>
  import("./pages/OAuthCallback").then((module) => ({ default: module.OAuthCallback }))
);
const PublicShop = lazy(() =>
  import("./pages/PublicShop").then((module) => ({ default: module.PublicShop }))
);
const PitchDeck = lazy(() =>
  import("./pages/PitchDeck").then((module) => ({ default: module.PitchDeck }))
);
const BusinessHome = lazy(() =>
  import("./pages/BusinessHome").then((module) => ({ default: module.BusinessHome }))
);

const HomeRedirect = () => {
  const { role, isAuthenticated, loading } = useAuth();
  
  console.log("HomeRedirect state:", { loading, isAuthenticated, role });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Home />;
  }
  if (role === "developer") {
    return <Navigate to="/developer" replace />;
  }
  if (role === "business") {
    return <Navigate to="/business" replace />;
  }
  if (role === "creator") {
    return <Navigate to="/creator" replace />;
  }
  return <Home />;
};

export const App = () => {
  const routeFallback = (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
    </div>
  );

  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/pitch-deck" element={<PitchDeck />} />
        <Route path="/business-home" element={<BusinessHome />} />
        <Route path="/shop/:slug" element={<PublicShop />} />
        <Route path="/api/oauth/:provider/callback" element={<OAuthCallback />} />
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute>
              <RoleGate role="developer">
                <DeveloperDashboard />
              </RoleGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/*"
          element={
            <ProtectedRoute>
              <RoleGate role="business">
                <BusinessDashboard />
              </RoleGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/*"
          element={
            <ProtectedRoute>
              <RoleGate role="creator">
                <CreatorDashboard />
              </RoleGate>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
