import React, { useState, useEffect } from "react";
import { 
  FiCheck, FiStar, FiZap, FiShield, FiTrendingUp, FiCreditCard,
  FiX, FiAlertCircle, FiDownload
} from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: {
    apiKeys?: number;
    apiCalls?: number;
    webhooks?: number;
    notifications?: number;
    teamMembers: number;
    customers?: number;
    socialAccounts?: number;
    postsPerMonth?: number;
    scheduledPosts?: number;
    mediaUploads?: number;
  };
  popular?: boolean;
}

interface Usage {
  apiKeys?: { used: number; limit: number };
  apiCalls?: { used: number; limit: number };
  webhooks?: { used: number; limit: number };
  notifications?: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
  customers?: { used: number; limit: number };
  socialAccounts?: { used: number; limit: number };
  postsPerMonth?: { used: number; limit: number };
  scheduledPosts?: { used: number; limit: number };
  mediaUploads?: { used: number; limit: number };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl?: string;
  createdAt: string;
}

interface BillingPlansProps {
  role?: "developer" | "business" | "creator";
  currentPlan?: string;
  onPlanChange?: (planId: string) => void;
  onPlanUpdated?: () => void;
}

export const BillingPlans: React.FC<BillingPlansProps> = ({
  role = "business",
  currentPlan: externalCurrentPlan,
  onPlanChange,
  onPlanUpdated
}) => {
  const { accessToken, csrfToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [internalCurrentPlan, setInternalCurrentPlan] = useState<string>("free");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"plans" | "usage" | "invoices">("plans");

  // Use external currentPlan if provided, otherwise use internal state
  const currentPlan = externalCurrentPlan !== undefined ? externalCurrentPlan : internalCurrentPlan;
  const setCurrentPlan = externalCurrentPlan !== undefined ? onPlanChange || (() => {}) : setInternalCurrentPlan;

  useEffect(() => {
    console.log("[BillingPlans] Component mounted with role:", role);
    fetchBillingData();
  }, [accessToken, role]);

  // Update internal state when external currentPlan changes
  useEffect(() => {
    if (externalCurrentPlan !== undefined) {
      setInternalCurrentPlan(externalCurrentPlan);
    }
  }, [externalCurrentPlan]);


  const fetchBillingData = async () => {
    if (!accessToken) return;
    setLoading(true);

    try {
      const [plansRes, usageRes, invoicesRes] = await Promise.all([
        apiRequest<{ plans: Plan[] }>(`/billing/plans?role=${role}`, { accessToken }),
        apiRequest<{ usage: Usage; planId: string }>("/billing/usage", { accessToken }),
        apiRequest<{ invoices: Invoice[] }>("/billing/invoices", { accessToken }),
      ]);

      setPlans(plansRes.plans);
      setUsage(usageRes.usage);
      setCurrentPlan(usageRes.planId);
      setInvoices(invoicesRes.invoices);
    } catch (err) {
      setError("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!accessToken || planId === currentPlan) return;

    setUpgrading(planId);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest("/billing/change-plan", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { planId },
      });

      setCurrentPlan(planId);
      setSuccess(`Successfully ${planId === "free" ? "downgraded" : "upgraded"} to ${planId} plan!`);
      fetchBillingData();
      // Call the external callback if provided
      if (onPlanChange) {
        onPlanChange(planId);
      }
      // Notify parent component that plan was updated
      if (onPlanUpdated) {
        onPlanUpdated();
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to change plan");
    } finally {
      setUpgrading(null);
    }
  };

  const formatUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "plans" 
              ? "border-blue-500 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Plans
        </button>
        <button
          onClick={() => setActiveTab("usage")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "usage" 
              ? "border-blue-500 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Usage
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "invoices" 
              ? "border-blue-500 text-blue-600" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <FiCheck className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 ${
                plan.popular ? "ring-2 ring-blue-500" : ""
              } ${currentPlan === plan.id ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  Current Plan
                </div>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-sm sm:text-base text-gray-500">/{plan.interval}</span>
              </div>

              {/* Features list - flex-1 to push button to bottom */}
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                    <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button at bottom */}
              <button
                onClick={() => handleChangePlan(plan.id)}
                disabled={currentPlan === plan.id || upgrading !== null}
                className={`w-full py-2.5 rounded-lg font-medium transition-all mt-auto ${
                  currentPlan === plan.id
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {upgrading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : plan.price > (plans.find(p => p.id === currentPlan)?.price || 0) ? (
                  "Upgrade"
                ) : (
                  "Downgrade"
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && usage && (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(usage)
            // Filter based on role:
            // - Developers: exclude customers (they don't deal with customers)
            // - Business: exclude apiKeys, apiCalls, webhooks (developer-only features)
            // - Creators: exclude apiKeys, apiCalls, webhooks, notifications, customers (social media focused)
            .filter(([key]) => {
              if (role === "developer") {
                return key !== "customers" && key !== "socialAccounts" && key !== "postsPerMonth" && key !== "scheduledPosts" && key !== "mediaUploads";
              } else if (role === "creator") {
                return key !== "apiKeys" && key !== "apiCalls" && key !== "webhooks" && key !== "notifications" && key !== "customers";
              } else {
                return key !== "apiKeys" && key !== "apiCalls" && key !== "webhooks" && key !== "socialAccounts" && key !== "postsPerMonth" && key !== "scheduledPosts" && key !== "mediaUploads";
              }
            })
            .map(([key, value]) => {
            const percent = formatUsagePercent(value.used, value.limit);
            const isUnlimited = value.limit === -1;
            const isAtLimit = !isUnlimited && value.used >= value.limit;
            const isApproaching = !isUnlimited && percent >= 50 && percent < 100;
            
            return (
              <div key={key} className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 ${
                isAtLimit ? "ring-2 ring-red-400" : isApproaching && percent >= 80 ? "ring-2 ring-orange-300" : ""
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <span className={`text-sm font-medium ${
                    isAtLimit ? "text-red-600" : isApproaching && percent >= 80 ? "text-orange-600" : "text-gray-500"
                  }`}>
                    {value.used.toLocaleString()} / {formatLimit(value.limit)}
                  </span>
                </div>
                
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isAtLimit 
                        ? "bg-red-500" 
                        : percent >= 80 
                          ? "bg-orange-500" 
                          : percent >= 50 
                            ? "bg-yellow-500" 
                            : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                
                {/* Warning Messages */}
                {isAtLimit ? (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      You've hit your limit!
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Kindly upgrade your plan to get more {key.replace(/([A-Z])/g, " $1").toLowerCase().trim()}.
                    </p>
                    <button
                      onClick={() => setActiveTab("plans")}
                      className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline"
                    >
                      View upgrade options →
                    </button>
                  </div>
                ) : isApproaching ? (
                  <div className={`mt-3 p-3 rounded-lg ${
                    percent >= 80 
                      ? "bg-orange-50 border border-orange-200" 
                      : "bg-yellow-50 border border-yellow-200"
                  }`}>
                    <p className={`text-sm font-medium flex items-center gap-2 ${
                      percent >= 80 ? "text-orange-700" : "text-yellow-700"
                    }`}>
                      <FiTrendingUp className="w-4 h-4" />
                      {percent >= 80 
                        ? "You're approaching your limit!" 
                        : "Over 50% used"}
                    </p>
                    <p className={`text-xs mt-1 ${
                      percent >= 80 ? "text-orange-600" : "text-yellow-600"
                    }`}>
                      Consider upgrading to avoid interruptions.
                    </p>
                    {percent >= 80 && (
                      <button
                        onClick={() => setActiveTab("plans")}
                        className="mt-2 text-xs font-semibold text-orange-700 hover:text-orange-900 underline"
                      >
                        View upgrade options →
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.status === "paid" 
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FiDownload className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// Current plan popup modal
interface CurrentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  plans: Plan[];
  role?: "developer" | "business" | "creator";
}

export const CurrentPlanModal: React.FC<CurrentPlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  plans,
  role = "business"
}) => {
  const currentPlanData = plans.find(plan => plan.id === currentPlan);

  if (!isOpen || !currentPlanData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Your Current Plan</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              <FiCheck className="w-4 h-4" />
              Current Plan
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentPlanData.name}</h3>
            <p className="text-gray-600 mb-4">{currentPlanData.description}</p>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              ${currentPlanData.price}
              <span className="text-lg text-gray-500 font-normal">/{currentPlanData.interval}</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Plan Features</h4>
            <ul className="space-y-2">
              {currentPlanData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limits */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Plan Limits</h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(currentPlanData.limits).map(([key, value]) => {
                if (role === "creator" && ["apiKeys", "apiCalls", "webhooks", "notifications", "customers"].includes(key)) {
                  return null; // Skip creator-irrelevant limits
                }
                if (role === "developer" && key === "customers") {
                  return null; // Skip developer-irrelevant limits
                }
                if (role === "business" && ["apiKeys", "apiCalls", "webhooks", "socialAccounts", "postsPerMonth", "scheduledPosts", "mediaUploads"].includes(key)) {
                  return null; // Skip business-irrelevant limits
                }

                return (
                  <div key={key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {value === -1 ? "Unlimited" : value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                // Could scroll to plans section or navigate to billing
                window.location.hash = "#billing-plans";
              }}
              className="flex-1 py-3 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
            >
              View All Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact usage widget for dashboard
interface UsageWidgetProps {
  role?: "developer" | "business";
}

export const UsageWidget: React.FC<UsageWidgetProps> = ({ role = "business" }) => {
  const { accessToken } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!accessToken) return;
      try {
        const res = await apiRequest<{ usage: Usage }>("/billing/usage", { accessToken });
        setUsage(res.usage);
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [accessToken]);

  if (loading || !usage) return null;

  const formatPercent = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  // Filter usage entries based on role:
  // - Developers: exclude customers (they don't deal with customers)
  // - Business: exclude apiKeys, apiCalls, webhooks (developer-only features)
  const filteredUsage = Object.entries(usage).filter(([key]) => {
    if (role === "developer") {
      return key !== "customers";
    } else {
      return key !== "apiKeys" && key !== "apiCalls" && key !== "webhooks";
    }
  });

  // Check if any usage is at or approaching limit
  const hasLimitIssues = filteredUsage.some(([, v]) => {
    const percent = formatPercent(v.used, v.limit);
    return v.limit !== -1 && percent >= 50;
  });

  return (
    <div className="space-y-3">
      {filteredUsage.slice(0, 3).map(([key, value]) => {
        const percent = formatPercent(value.used, value.limit);
        const isUnlimited = value.limit === -1;
        const isAtLimit = !isUnlimited && value.used >= value.limit;
        const isApproaching = !isUnlimited && percent >= 50;
        
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`capitalize ${
                isAtLimit ? "text-red-600 font-medium" : 
                isApproaching && percent >= 80 ? "text-orange-600" : 
                "text-gray-600"
              }`}>
                {key.replace(/([A-Z])/g, " $1").trim()}
                {isAtLimit && " ⚠️"}
              </span>
              <span className={`font-medium ${
                isAtLimit ? "text-red-600" : 
                isApproaching && percent >= 80 ? "text-orange-600" : 
                isApproaching ? "text-yellow-600" :
                "text-gray-900"
              }`}>
                {percent}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  isAtLimit 
                    ? "bg-red-500" 
                    : percent >= 80 
                      ? "bg-orange-500" 
                      : percent >= 50 
                        ? "bg-yellow-500" 
                        : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            {isAtLimit && (
              <p className="text-xs text-red-600 mt-1">Limit reached!</p>
            )}
            {!isAtLimit && isApproaching && percent >= 80 && (
              <p className="text-xs text-orange-600 mt-1">Approaching limit</p>
            )}
          </div>
        );
      })}
      
      {/* Overall warning banner */}
      {hasLimitIssues && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-700 font-medium">
            Consider upgrading your plan
          </p>
        </div>
      )}
    </div>
  );
};
