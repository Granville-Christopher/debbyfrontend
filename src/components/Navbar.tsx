import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiMenu, FiX } from "react-icons/fi";
import { Logo } from "./Logo";
import { DarkModeToggle } from "./DarkModeToggle";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isInstallable, promptInstall } = useInstallPrompt();

  const navLinks = [
    { name: "Integrations", to: "/integrations" },
    { name: "Automations", to: "/automations" },
    { name: "Solutions", to: "/solutions" },
    { name: "Pricing", to: "/pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a1628]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className=" mx-auto px-3 md:px-20 py-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <Link 
            to="/login" 
            className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="hidden md:block btn btn-primary"
          >
            Get Started
          </Link>
          <button 
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#0a1628] border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="text-lg font-bold text-gray-900 dark:text-white" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100 dark:border-gray-800" />
              <div className="flex flex-col gap-4">
                {isInstallable && (
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 py-3 font-bold text-gray-900 dark:text-white"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      void promptInstall();
                    }}
                  >
                    <FiDownload className="h-5 w-5" />
                    Install App
                  </button>
                )}
                <Link 
                  to="/login" 
                  className="w-full text-center py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
