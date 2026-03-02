import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
