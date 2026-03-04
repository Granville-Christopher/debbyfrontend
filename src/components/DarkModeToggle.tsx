import React, { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage, default to dark mode (true)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        return saved === "true";
      }
      // Default to dark mode
      return true;
    }
    return true; // Default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  }, [darkMode]);

  const toggleDarkMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newMode = !darkMode;

    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(newMode));
    }

    const root = document.documentElement;

    if (newMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }

    setDarkMode(newMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 rounded-lg bg-white/80 dark:bg-[#0f1f3a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-[#0f1f3a] transition-all shadow-lg hover:shadow-xl relative z-50 cursor-pointer"
      style={{ pointerEvents: "auto" }}
    >
      {darkMode ? (
        <FiSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
};
