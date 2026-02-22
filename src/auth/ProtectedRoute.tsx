import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
