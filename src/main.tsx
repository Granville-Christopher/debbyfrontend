import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { AdminAuthProvider } from "./auth/AdminAuthProvider";
import { ErrorBoundary } from "./ErrorBoundary";
import { InstallPromptProvider } from "./hooks/useInstallPrompt";
import { InstallPromptModal } from "./components/InstallPromptModal";
import "./index.css";

// Minimal service worker registration to enable install prompt (no caching)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <InstallPromptProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <App />
              <InstallPromptModal />
            </AdminAuthProvider>
          </AuthProvider>
        </InstallPromptProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
