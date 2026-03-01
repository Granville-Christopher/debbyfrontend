import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiBriefcase, FiChevronDown, FiLogOut, FiMenu, FiSettings, FiShield, FiX } from "react-icons/fi";

interface BizNavProps {
  userEmail?: string;
  orgName?: string;
  orgId?: string;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  onOpenAccountSettings?: () => void;
  onLogoutAllSessions?: () => void;
  onLogout?: () => void;
}

export const BizNav: React.FC<BizNavProps> = ({
  userEmail,
  orgName,
  orgId,
  isMobileMenuOpen,
  onMobileMenuToggle,
  onOpenAccountSettings,
  onLogoutAllSessions,
  onLogout
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const avatarLabel = useMemo(() => {
    const source = String(userEmail || orgName || "").trim();
    return source ? source.charAt(0).toUpperCase() : "U";
  }, [userEmail, orgName]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-white/70 backdrop-blur-2xl shadow-lg shadow-gray-200/30 h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DEBBY</span>
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          <span className="text-gray-600 font-medium">Business Dashboard</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
            <FiBriefcase className="w-4 h-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Organization</span>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{orgName || "-"}</span>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white/90 px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-sm transition hover:shadow-md"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open account menu"
            >
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] sm:text-xs font-bold text-white">
                {avatarLabel}
              </span>
              <span className="hidden sm:block text-xs font-medium text-gray-700">Account</span>
              <FiChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-40 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                <div className="rounded-lg bg-slate-50 px-3 py-2 mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 break-all">{userEmail || "-"}</p>
                  {orgId ? <p className="text-[11px] text-slate-500 mt-1">Org: {orgId}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAccountSettings?.();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <FiSettings className="h-4 w-4" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogoutAllSessions?.();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition"
                >
                  <FiShield className="h-4 w-4" />
                  Sign out all sessions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <FiLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg bg-white/70 border border-gray-200 text-gray-700 hover:bg-white"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
