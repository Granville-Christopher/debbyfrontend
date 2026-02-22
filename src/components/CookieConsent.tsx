import React, { useState, useEffect } from "react";
import { FiX, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 bg-white/95 dark:bg-[#0f1f3a]/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl"
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiShield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              We use cookies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link
                to="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
