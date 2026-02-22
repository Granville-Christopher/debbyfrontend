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
    // Apply dark mode class whenever state changes
    // Tailwind expects the 'dark' class on the html element for darkMode: 'class'
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
    
    // Verify the class was applied
    console.log("useEffect - darkMode:", darkMode, "HTML has 'dark' class:", root.classList.contains("dark"));
  }, [darkMode]);

  const toggleDarkMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Toggle clicked! Current darkMode:", darkMode);
    
    const newMode = !darkMode;
    console.log("New mode:", newMode);
    
    // Save to localStorage first
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(newMode));
      console.log("Saved to localStorage:", String(newMode));
    }
    
    // Apply immediately to DOM
    // Tailwind expects the 'dark' class on the html element for darkMode: 'class'
    const root = document.documentElement;
    const body = document.body;
    
    if (newMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
      // Force style recalculation
      void root.offsetHeight;
      void body.offsetHeight;
      // Force repaint
      root.style.display = 'none';
      void root.offsetHeight;
      root.style.display = '';
      console.log("Added 'dark' class to html element");
      console.log("HTML classes:", root.className);
      console.log("HTML has 'dark' class:", root.classList.contains("dark"));
      console.log("Body computed background:", window.getComputedStyle(body).backgroundColor);
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
      // Force style recalculation
      void root.offsetHeight;
      void body.offsetHeight;
      // Force repaint
      root.style.display = 'none';
      void root.offsetHeight;
      root.style.display = '';
      console.log("Removed 'dark' class from html element");
      console.log("HTML classes:", root.className);
      console.log("HTML has 'dark' class:", root.classList.contains("dark"));
      console.log("Body computed background:", window.getComputedStyle(body).backgroundColor);
    }
    
    // Update state
    setDarkMode(newMode);
    console.log("State updated to:", newMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 rounded-lg bg-white/80 dark:bg-[#0f1f3a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-[#0f1f3a] transition-all shadow-lg hover:shadow-xl relative z-50 cursor-pointer"
      style={{ pointerEvents: 'auto' }}
    >
      {darkMode ? (
        <FiSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
};
