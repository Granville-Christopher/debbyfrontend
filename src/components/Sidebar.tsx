import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMenu, FiX } from "react-icons/fi";

interface SidebarProps {
  tabs: Array<{ id: string; label: string; icon: React.ReactNode; locked?: boolean; badge?: string }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hideOnSmallScreens?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  showMobileToggleButton?: boolean;
  showLogout?: boolean;
  compactOpenWidthOnMobileMd?: boolean;
  compactLinkDensity?: boolean;
  theme?: "light" | "dark";
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
  showLogout = true,
  compactOpenWidthOnMobileMd = false,
  compactLinkDensity = false,
  theme = "light",
}) => {
  const isDark = theme === "dark";
  const [isSmall, setIsSmall] = useState(window.innerWidth < 640);
  const [isBelowLg, setIsBelowLg] = useState(window.innerWidth < 1024);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobileHiddenMode = hideOnSmallScreens && isSmall;
  const isMobileMenuOpen = mobileMenuOpenProp ?? internalMobileMenuOpen;
  const isCompactOpenWidth = compactOpenWidthOnMobileMd && isBelowLg;
  const expandedSidebarWidth = isCompactOpenWidth ? 180 : 180;
  const expandedToggleLeft = isCompactOpenWidth ? "168px" : "168px";

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 640);
      setIsBelowLg(window.innerWidth < 1024);
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
    root.style.setProperty(
      "--sidebar-width",
      isCollapsed ? (isSmall ? "40px" : "80px") : `${expandedSidebarWidth}px`
    );
  }, [isCollapsed, isSmall, isMobileHiddenMode, expandedSidebarWidth]);

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
          className={`fixed z-30 p-2.5 backdrop-blur-xl rounded-full transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-slate-900/85 border border-slate-700 shadow-lg shadow-black/30 hover:bg-slate-800"
              : "bg-white/80 shadow-lg shadow-gray-200/50 hover:bg-white hover:shadow-xl"
          }`}
          style={{
            left: isMobileHiddenMode ? "12px" : isCollapsed ? (isSmall ? "28px" : "68px") : expandedToggleLeft,
            top: "76px",
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
              <FiX className={`w-4 h-4 ${isDark ? "text-slate-200" : "text-gray-600"}`} />
            ) : (
              <FiMenu className={`w-4 h-4 ${isDark ? "text-slate-200" : "text-gray-600"}`} />
            )
          ) : isCollapsed ? (
            <FiChevronRight className={`w-4 h-4 ${isDark ? "text-slate-200" : "text-gray-600"}`} />
          ) : (
            <FiChevronLeft className={`w-4 h-4 ${isDark ? "text-slate-200" : "text-gray-600"}`} />
          )}
        </button>
      )}

      {isMobileHiddenMode && isMobileMenuOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 top-16 z-30 bg-black/30 transition-opacity duration-500"
        />
      )}

      <div
        className={`${isDark ? "bg-slate-950/85 border-r border-slate-800 shadow-2xl shadow-black/40" : "bg-white/70 shadow-2xl shadow-gray-300/30"} backdrop-blur-2xl fixed left-0 transition-all duration-500 ease-out ${
          isMobileHiddenMode
            ? `z-40 ${isCompactOpenWidth ? "w-[180px]" : "w-72"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
            : `${isCollapsed ? "w-10 sm:w-20" : isCompactOpenWidth ? "w-[180px] lg:w-72" : "w-[180px]"} z-10`
        }`}
        style={{ top: "64px", height: "calc(100vh - 64px)" }}
      >
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <nav className="flex-1 p-1 overflow-y-auto">
            <div className={compactLinkDensity ? "space-y-1" : "space-y-2"}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    closeMobileMenu();
                  }}
                  className={`w-full flex items-center ${isCollapsed && !isMobileHiddenMode ? "justify-center" : "gap-3"} px-4 ${compactLinkDensity ? "py-2.5" : "py-3"} rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? isDark
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 font-semibold border border-cyan-400/30"
                        : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 font-semibold shadow-lg shadow-blue-200/30"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/80"
                      : "text-gray-600 hover:bg-white/80 hover:shadow-md"
                  }`}
                  title={isCollapsed && !isMobileHiddenMode ? tab.label : undefined}
                >
                  <span className="relative text-lg flex-shrink-0 flex items-center justify-center">
                    {tab.icon}
                    {tab.badge && (
                      <span
                        className={`absolute -right-2 -top-2 min-w-[18px] rounded-full border px-1 text-center text-[10px] font-semibold leading-4 ${
                          isDark
                            ? "border-rose-400/40 bg-rose-500/20 text-rose-100"
                            : "border-rose-300 bg-rose-100 text-rose-700"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                  {(!isCollapsed || isMobileHiddenMode) && (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className={`capitalize truncate ${compactLinkDensity ? "text-sm" : ""}`}>
                        {tab.label.replace("-", " ")}
                      </span>
                      {tab.locked ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            isDark
                              ? "border-amber-400/40 bg-amber-500/20 text-amber-200"
                              : "border-amber-300 bg-amber-100 text-amber-700"
                          }`}
                        >
                          {tab.badge || "Locked"}
                        </span>
                      ) : tab.badge ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            isDark
                              ? "border-rose-400/40 bg-rose-500/20 text-rose-100"
                              : "border-rose-300 bg-rose-100 text-rose-700"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {showLogout && (
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
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
