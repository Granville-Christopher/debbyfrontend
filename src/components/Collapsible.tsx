import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 bg-transparent hover:bg-white/50 flex items-center justify-between text-left transition-all duration-300"
      >
        <span className="font-semibold text-gray-900 text-lg">{title}</span>
        <div className={`p-2 rounded-full bg-gray-100/80 transition-all duration-300 ${isOpen ? "rotate-180 bg-blue-100/80" : ""}`}>
          <FiChevronDown className={`w-4 h-4 transition-colors ${isOpen ? "text-blue-600" : "text-gray-500"}`} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="px-6 py-5 bg-gradient-to-b from-white/30 to-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
