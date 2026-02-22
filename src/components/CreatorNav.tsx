import React from "react";
import { FiUser, FiFeather, FiStar } from "react-icons/fi";

interface CreatorNavProps {
  userEmail?: string;
  orgName?: string;
  orgId?: string;
  currentPlan?: string;
}

export const CreatorNav: React.FC<CreatorNavProps> = ({ userEmail, orgName, orgId, currentPlan }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-2xl shadow-lg shadow-gray-200/30 h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">DEBBY</span>
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          <span className="text-gray-600 font-medium">Creator Studio</span>
        </div>
        
        {/* User Info - Hidden on small screens, visible on md+ */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
            <FiFeather className="w-4 h-4 text-pink-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Creator</span>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{orgName || "—"}</span>
            </div>
          </div>
          {currentPlan && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <FiStar className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-600 font-medium">Plan</span>
                <span className="text-sm font-semibold text-blue-800 capitalize">{currentPlan}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
            <FiUser className="w-4 h-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Account</span>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{userEmail || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
