import React from "react";

export const Layout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>{title}</h1>
      <main>{children}</main>
    </div>
  );
};
