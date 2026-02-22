import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiLogOut, FiMenu, FiX } from "react-icons/fi";

interface SidebarProps {
  tabs: Array<{ id: string; label: string; icon: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hideOnSmallScreens?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  showMobileToggleButton?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  hideOnSmallScreens = false,
  mobileMenuOpen: mobileMenuOpenProp,
  onMobileMenuOpenChange,
  showMobileToggleButton = true,
}) => {
  const [isSmall, setIsSmall] = useState(window.innerWidth < 640);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileHiddenMode = hideOnSmallScreens && isSmall;
  const isMobileMenuOpen = mobileMenuOpenProp ?? internalMobileMenuOpen;

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isMobileHiddenMode) {
      root.style.setProperty("--sidebar-width", "0px");
      return;
    }
    root.style.setProperty("--sidebar-width", isCollapsed ? (isSmall ? "40px" : "80px") : "280px");
  }, [isCollapsed, isSmall, isMobileHiddenMode]);

  useEffect(() => {
    if (!isSmall) {
      if (onMobileMenuOpenChange) {
        onMobileMenuOpenChange(false);
      } else {
        setInternalMobileMenuOpen(false);
      }
    }
  }, [isSmall, onMobileMenuOpenChange]);

  const setMobileMenuOpen = (open: boolean) => {
    if (onMobileMenuOpenChange) {
      onMobileMenuOpenChange(open);
      return;
    }
    setInternalMobileMenuOpen(open);
  };

  const handleToggle = () => {
    if (isMobileHiddenMode) {
      setMobileMenuOpen(!isMobileMenuOpen);
      return;
    }
    onToggleCollapse();
  };

  const closeMobileMenu = () => {
    if (isMobileHiddenMode) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Collapse Button - Glassmorphism style */}
      {(!isMobileHiddenMode || showMobileToggleButton) && (
        <button
          onClick={handleToggle}
          className="fixed z-30 p-2.5 bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 rounded-full transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
          style={{
            left: isMobileHiddenMode ? "12px" : isCollapsed ? (isSmall ? "28px" : "68px") : "268px",
            top: "88px",
          }}
          aria-label={
            isMobileHiddenMode
              ? isMobileMenuOpen
                ? "Close menu"
                : "Open menu"
              : isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isMobileHiddenMode ? (
            isMobileMenuOpen ? (
              <FiX className="w-4 h-4 text-gray-600" />
            ) : (
              <FiMenu className="w-4 h-4 text-gray-600" />
            )
          ) : isCollapsed ? (
            <FiChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <FiChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {isMobileHiddenMode && isMobileMenuOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 top-16 z-30 bg-black/30"
        />
      )}

      <div
        className={`bg-white/70 backdrop-blur-2xl fixed left-0 transition-all duration-300 shadow-2xl shadow-gray-300/30 ${
          isMobileHiddenMode
            ? `z-40 w-72 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
            : `${isCollapsed ? "w-10 sm:w-20" : "w-72"} z-10`
        }`}
        style={{ top: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <nav className="flex-1 p-1 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    closeMobileMenu();
                  }}
                  className={`w-full flex items-center ${isCollapsed && !isMobileHiddenMode ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 font-semibold shadow-lg shadow-blue-200/30"
                      : "text-gray-600 hover:bg-white/80 hover:shadow-md"
                  }`}
                  title={isCollapsed && !isMobileHiddenMode ? tab.label : undefined}
                >
                  <span className="text-lg flex-shrink-0 flex items-center justify-center">
                    {tab.icon}
                  </span>
                  {(!isCollapsed || isMobileHiddenMode) && (
                    <span className="capitalize truncate">
                      {tab.label.replace("-", " ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer with Logout */}
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onLogout();
              }}
              className={`w-full flex items-center ${isCollapsed && !isMobileHiddenMode ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5`}
              title={isCollapsed && !isMobileHiddenMode ? "Logout" : undefined}
            >
              <span className="text-lg flex-shrink-0 flex items-center justify-center">
                <FiLogOut />
              </span>
              {(!isCollapsed || isMobileHiddenMode) && <span className="font-semibold">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
