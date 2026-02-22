import React, { useEffect, useState, useCallback } from "react";
import { FiX, FiCommand } from "react-icons/fi";

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

interface ShortcutGroup {
  name: string;
  shortcuts: Shortcut[];
}

const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const modKey = isMac ? "⌘" : "Ctrl";

const shortcutGroups: ShortcutGroup[] = [
  {
    name: "Navigation",
    shortcuts: [
      { keys: [modKey, "K"], description: "Open global search" },
      { keys: [modKey, "?"], description: "Open help center" },
      { keys: ["G", "O"], description: "Go to Overview" },
      { keys: ["G", "S"], description: "Go to Settings" },
    ],
  },
  {
    name: "Developer Dashboard",
    shortcuts: [
      { keys: ["G", "A"], description: "Go to API Keys" },
      { keys: ["G", "W"], description: "Go to Webhooks" },
      { keys: ["G", "E"], description: "Go to Events" },
      { keys: ["G", "I"], description: "Go to Integrations" },
    ],
  },
  {
    name: "Business Dashboard",
    shortcuts: [
      { keys: ["G", "P"], description: "Go to Payments" },
      { keys: ["G", "N"], description: "Go to Notifications" },
      { keys: ["G", "C"], description: "Go to Customers" },
    ],
  },
  {
    name: "Actions",
    shortcuts: [
      { keys: [modKey, "N"], description: "Create new item" },
      { keys: [modKey, "S"], description: "Save changes" },
      { keys: ["Esc"], description: "Close modal/dialog" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
              <FiCommand className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {shortcutGroups.map(group => (
              <div key={group.name}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-mono shadow-sm">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs mx-0.5">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-200/50 text-center text-sm text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

// Hook for keyboard shortcuts
interface UseKeyboardShortcutsOptions {
  onNavigate?: (tab: string) => void;
  onSearch?: () => void;
  onHelp?: () => void;
  onNew?: () => void;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [lastKeyTime, setLastKeyTime] = useState(0);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    
    // Don't trigger shortcuts when typing in inputs
    if (isInput && !e.ctrlKey && !e.metaKey) return;
    
    const now = Date.now();
    const key = e.key.toUpperCase();
    
    // Check for modifier + key combinations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          options.onSearch?.();
          return;
        case "/":
        case "?":
          e.preventDefault();
          options.onHelp?.();
          return;
        case "n":
          if (!isInput) {
            e.preventDefault();
            options.onNew?.();
          }
          return;
      }
    }
    
    // Check for sequence shortcuts (G + letter within 500ms)
    if (now - lastKeyTime < 500 && lastKey === "G") {
      e.preventDefault();
      switch (key) {
        case "O":
          options.onNavigate?.("overview");
          break;
        case "S":
          options.onNavigate?.("settings");
          break;
        case "A":
          options.onNavigate?.("api-keys");
          break;
        case "W":
          options.onNavigate?.("webhooks");
          break;
        case "E":
          options.onNavigate?.("events");
          break;
        case "I":
          options.onNavigate?.("integrations");
          break;
        case "P":
          options.onNavigate?.("payments");
          break;
        case "N":
          options.onNavigate?.("notifications");
          break;
        case "C":
          options.onNavigate?.("customers");
          break;
      }
      setLastKey(null);
      return;
    }
    
    // Show shortcuts modal with Shift+?
    if (e.key === "?" && e.shiftKey && !isInput) {
      e.preventDefault();
      setShowShortcutsModal(true);
      return;
    }
    
    // Start sequence
    if (key === "G" && !isInput) {
      setLastKey("G");
      setLastKeyTime(now);
      return;
    }
    
    // Close modal with Escape
    if (e.key === "Escape") {
      setShowShortcutsModal(false);
    }
  }, [lastKey, lastKeyTime, options]);
  
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    showShortcutsModal,
    setShowShortcutsModal,
    ShortcutsModal: () => (
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />
    ),
  };
};

// Small indicator component to show keyboard shortcut hints
interface ShortcutHintProps {
  keys: string[];
  className?: string;
}

export const ShortcutHint: React.FC<ShortcutHintProps> = ({ keys, className = "" }) => {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-500">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-gray-300">+</span>}
        </React.Fragment>
      ))}
    </span>
  );
};
