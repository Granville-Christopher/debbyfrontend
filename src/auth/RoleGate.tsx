import React from "react";
import { Navigate } from "react-router-dom";
import { Role, useAuth } from "./AuthProvider";

export const RoleGate = ({
  role,
  children
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  const { role: currentRole, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
