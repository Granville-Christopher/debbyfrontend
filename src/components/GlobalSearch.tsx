import React, { useEffect, useState, useCallback, useRef } from "react";
import { FiSearch, FiX, FiUser, FiCreditCard, FiBell, FiLink, FiKey, FiFileText, FiCommand } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface SearchResult {
  type: "customer" | "payment" | "notification" | "webhook" | "apiKey" | "event" | "template";
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: SearchResult) => void;
  role: "developer" | "business";
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelect, role }) => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!accessToken) return;
    setLoading(true);
    
    try {
      const searchResults: SearchResult[] = [];
      
      if (role === "business") {
        // Search customers
        try {
          const customers = await apiRequest<{ customers: any[] }>(
            `/business/customers?search=${encodeURIComponent(searchQuery)}&limit=5`,
            { accessToken }
          );
          customers.customers.forEach(c => {
            searchResults.push({
              type: "customer",
              id: c.id,
              title: c.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : c.email,
              subtitle: c.email,
              meta: c.company,
            });
          });
        } catch {}
        
        // Search payments
        try {
          const payments = await apiRequest<{ payments: any[] }>(
            `/business/payments?limit=50`,
            { accessToken }
          );
          payments.payments
            .filter(p => 
              p.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5)
            .forEach(p => {
              searchResults.push({
                type: "payment",
                id: p.id,
                title: `$${p.amount} ${p.currency}`,
                subtitle: p.customerEmail || p.description,
                meta: p.status,
              });
            });
        } catch {}
        
        // Search templates
        try {
          const templates = await apiRequest<{ templates: any[] }>(
            `/business/templates`,
            { accessToken }
          );
          templates.templates
            .filter(t => 
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.body.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5)
            .forEach(t => {
              searchResults.push({
                type: "template",
                id: t.id,
                title: t.name,
                subtitle: t.channel,
                meta: `${t.variables.length} variables`,
              });
            });
        } catch {}
      } else {
        // Developer search
        // Search webhooks
        try {
          const webhooks = await apiRequest<{ webhooks: any[] }>(
            `/developer/webhooks`,
            { accessToken }
          );
          webhooks.webhooks
            .filter(w => w.url.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .forEach(w => {
              searchResults.push({
                type: "webhook",
                id: w.id,
                title: new URL(w.url).hostname,
                subtitle: w.url,
                meta: w.enabled ? "Active" : "Disabled",
              });
            });
        } catch {}
        
        // Search API keys
        try {
          const keys = await apiRequest<{ apiKeys: any[] }>(
            `/developer/api-keys`,
            { accessToken }
          );
          keys.apiKeys
            .filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .forEach(k => {
              searchResults.push({
                type: "apiKey",
                id: k.id,
                title: k.name,
                subtitle: `****${k.lastFour}`,
                meta: k.environment,
              });
            });
        } catch {}
        
        // Search events
        try {
          const events = await apiRequest<{ events: any[] }>(
            `/developer/events`,
            { accessToken }
          );
          events.events
            .filter(e => e.eventType.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5)
            .forEach(e => {
              searchResults.push({
                type: "event",
                id: e.id,
                title: e.eventType,
                subtitle: new Date(e.createdAt).toLocaleString(),
                meta: e.status,
              });
            });
        } catch {}
      }
      
      setResults(searchResults);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelect(results[selectedIndex]);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [results, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "customer": return <FiUser className="w-4 h-4" />;
      case "payment": return <FiCreditCard className="w-4 h-4" />;
      case "notification": return <FiBell className="w-4 h-4" />;
      case "webhook": return <FiLink className="w-4 h-4" />;
      case "apiKey": return <FiKey className="w-4 h-4" />;
      case "event": return <FiFileText className="w-4 h-4" />;
      case "template": return <FiBell className="w-4 h-4" />;
      default: return <FiSearch className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "customer": return "bg-blue-100 text-blue-700";
      case "payment": return "bg-green-100 text-green-700";
      case "notification": return "bg-purple-100 text-purple-700";
      case "webhook": return "bg-orange-100 text-orange-700";
      case "apiKey": return "bg-yellow-100 text-yellow-700";
      case "event": return "bg-gray-100 text-gray-700";
      case "template": return "bg-pink-100 text-pink-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200/50">
          <FiSearch className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-lg outline-none placeholder-gray-400"
            placeholder="Search customers, payments, webhooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
            <span>select</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">esc</kbd>
            <span>close</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query.length < 2 ? (
                <div>
                  <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Type at least 2 characters to search</p>
                  <p className="text-sm mt-2">
                    Tip: Press <kbd className="px-1 bg-gray-100 rounded">Ctrl+K</kbd> to open search anytime
                  </p>
                </div>
              ) : (
                <div>
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onSelect(result);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                  )}
                </div>
                {result.meta && (
                  <span className="text-xs text-gray-400 capitalize">{result.meta}</span>
                )}
              </button>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-200/50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-0.5 rounded ${getTypeColor("customer")}`}>Customers</span>
            <span className={`px-2 py-0.5 rounded ${getTypeColor("payment")}`}>Payments</span>
            <span className={`px-2 py-0.5 rounded ${role === "developer" ? getTypeColor("webhook") : getTypeColor("template")}`}>
              {role === "developer" ? "Webhooks" : "Templates"}
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
};

// Hook to use keyboard shortcut
export const useGlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
};
