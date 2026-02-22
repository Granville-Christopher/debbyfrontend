import React, { useState, useEffect } from "react";
import { 
  FiX, FiSearch, FiBook, FiCode, FiBriefcase, FiUser, FiHelpCircle,
  FiExternalLink, FiChevronRight, FiMessageCircle, FiMail
} from "react-icons/fi";
import { apiRequest } from "../api/client";

interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content?: string;
  tags?: string[];
  excerpt?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"articles" | "faqs" | "contact">("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHelpData();
    }
  }, [isOpen]);

  const fetchHelpData = async () => {
    setLoading(true);
    try {
      const [articlesRes, faqsRes] = await Promise.all([
        fetch("/help/articles").then(r => r.json()).catch(() => ({ articles: [] })),
        fetch("/help/faqs").then(r => r.json()).catch(() => ({ faqs: [] })),
      ]);
      setArticles(articlesRes.articles || []);
      setFaqs(faqsRes.faqs || []);
    } catch (error) {
      console.error("Failed to fetch help data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/help/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json());
      setArticles(res.results || []);
      setActiveTab("articles");
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (articleId: string) => {
    try {
      const res = await fetch(`/help/articles/${articleId}`).then(r => r.json());
      setSelectedArticle(res.article);
    } catch (error) {
      console.error("Failed to fetch article:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "getting started": return <FiBook className="w-5 h-5" />;
      case "developer": return <FiCode className="w-5 h-5" />;
      case "business": return <FiBriefcase className="w-5 h-5" />;
      case "account": return <FiUser className="w-5 h-5" />;
      default: return <FiHelpCircle className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
              <FiHelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Help Center</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => { setActiveTab("articles"); setSelectedArticle(null); }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "articles" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => { setActiveTab("faqs"); setSelectedArticle(null); }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "faqs" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => { setActiveTab("contact"); setSelectedArticle(null); }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contact" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Contact Us
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : selectedArticle ? (
            // Article Detail
            <div className="p-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                ← Back to articles
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-blue-100 text-blue-700`}>
                  {getCategoryIcon(selectedArticle.category)}
                </div>
                <span className="text-sm text-gray-500">{selectedArticle.category}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h3>
              <div 
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: selectedArticle.content?.replace(/\n/g, "<br>") || "" 
                }}
              />
            </div>
          ) : activeTab === "articles" ? (
            // Articles List
            <div className="p-6">
              <div className="grid gap-3">
                {articles.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No articles found</p>
                ) : (
                  articles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-blue-100 text-blue-700`}>
                        {getCategoryIcon(article.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <p className="text-sm text-gray-500">{article.category}</p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === "faqs" ? (
            // FAQs
            <div className="p-6">
              <div className="space-y-3">
                {faqs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No FAQs available</p>
                ) : (
                  faqs.map(faq => (
                    <div
                      key={faq.id}
                      className="bg-gray-50 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <FiChevronRight 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedFaq === faq.id ? "rotate-90" : ""
                          }`} 
                        />
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 text-gray-600">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Contact
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <a
                  href="mailto:support@debby.io"
                  className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <FiMail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Support</h4>
                    <p className="text-sm text-gray-500">support@debby.io</p>
                  </div>
                </a>
                
                <a
                  href="https://discord.gg/debby"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <FiMessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Discord Community</h4>
                    <p className="text-sm text-gray-500">Join our community</p>
                  </div>
                  <FiExternalLink className="w-5 h-5 text-gray-400" />
                </a>
                
                <a
                  href="/support"
                  className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors md:col-span-2"
                >
                  <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <FiHelpCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Submit a Ticket</h4>
                    <p className="text-sm text-gray-500">Create a support ticket for detailed assistance</p>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </a>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Support Hours</h4>
                <p className="text-sm text-blue-700">
                  Monday - Friday: 9:00 AM - 6:00 PM (UTC)<br />
                  Saturday - Sunday: Limited support
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to toggle help center
export const useHelpCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  return { isOpen, setIsOpen };
};
