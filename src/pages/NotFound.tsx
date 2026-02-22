import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/40 p-12">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-8 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary text-base py-4 px-8 gap-2">
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};
