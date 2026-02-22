import React from "react";
import { FiUser, FiBriefcase } from "react-icons/fi";

interface DevNavProps {
  userEmail?: string;
  orgName?: string;
  orgId?: string;
}

export const DevNav: React.FC<DevNavProps> = ({ userEmail, orgName, orgId }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-2xl shadow-lg shadow-gray-200/30 h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DEBBY</span>
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          <span className="text-gray-600 font-medium">Developer Dashboard</span>
        </div>
        
        {/* Organization Info - Hidden on small screens, visible on md+ */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
            <FiBriefcase className="w-4 h-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Organization</span>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{orgName || "—"}</span>
            </div>
          </div>
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
