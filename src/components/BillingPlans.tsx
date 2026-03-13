import React, { useEffect, useMemo, useState } from "react";
import { 
  FiCheck, FiTrendingUp, FiCreditCard,
  FiX, FiAlertCircle, FiDownload, FiExternalLink
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

type BusinessTierMeta = {
  displayName: string;
  tierLabel: string;
  goal: string;
  transactionFee: string;
  cap: string;
  serviceLevel: string[];
  support: string;
  checkoutAccess: string;
  dashboardAccess: string;
  commerceMode: string;
};

// Canonical plan order: starter → growth → scale
const BUSINESS_PLAN_ORDER = ["starter", "growth", "scale"];

const BUSINESS_TIER_META: Record<string, BusinessTierMeta> = {
  starter: {
    displayName: "Starter",
    tierLabel: "Starter Tier",
    goal: "Low-friction adoption",
    transactionFee: "0%",
    cap: "No Debby transaction-fee cap needed",
    serviceLevel: [
      "Storefront + catalog + checkout essentials",
      "Basic CRM and analytics",
      "Optional WhatsApp order completion"
    ],
    support: "Email support only",
    checkoutAccess: "Card checkout + optional WhatsApp completion",
    dashboardAccess: "Core dashboard, Analytics, Surveys",
    commerceMode: "Own inventory mode (dropshipping locked)"
  },
  growth: {
    displayName: "Growth",
    tierLabel: "Growth (Mid)",
    goal: "Scale operations with automation",
    transactionFee: "0.50% local, 0.75% international",
    cap: "Cap: NGN 2,000 per transaction",
    serviceLevel: [
      "Everything in Starter",
      "Advanced automation + recovery",
      "Advanced analytics + integrations"
    ],
    support: "Email + in-app support",
    checkoutAccess: "Gateway checkout only (WhatsApp completion disabled)",
    dashboardAccess: "All modules unlocked (Automation, Intelligence, Ops, Analytics, Surveys)",
    commerceMode: "Own, Dropship, and Hybrid modes"
  },
  // Legacy alias so existing subscriptions with "professional" still render
  professional: {
    displayName: "Growth",
    tierLabel: "Growth (Mid)",
    goal: "Scale operations with automation",
    transactionFee: "0.50% local, 0.75% international",
    cap: "Cap: NGN 2,000 per transaction",
    serviceLevel: [
      "Everything in Starter",
      "Advanced automation + recovery",
      "Advanced analytics + integrations"
    ],
    support: "Email + in-app support",
    checkoutAccess: "Gateway checkout only (WhatsApp completion disabled)",
    dashboardAccess: "All modules unlocked (Automation, Intelligence, Ops, Analytics, Surveys)",
    commerceMode: "Own, Dropship, and Hybrid modes"
  },
  scale: {
    displayName: "Scale",
    tierLabel: "Scale (High)",
    goal: "Highest access with the lowest fee rate",
    transactionFee: "0.25% local, 0.40% international",
    cap: "Cap: NGN 1,000 per transaction",
    serviceLevel: [
      "Everything in Growth",
      "Full premium modules and controls",
      "Priority SLA-grade support"
    ],
    support: "Priority support handling + in-app support",
    checkoutAccess: "Gateway checkout only (WhatsApp completion disabled)",
    dashboardAccess: "All modules unlocked (Automation, Intelligence, Ops, Analytics, Surveys)",
    commerceMode: "Own, Dropship, and Hybrid modes"
  },
  // Legacy alias
  enterprise: {
    displayName: "Scale",
    tierLabel: "Scale (High)",
    goal: "Highest access with the lowest fee rate",
    transactionFee: "0.25% local, 0.40% international",
    cap: "Cap: NGN 1,000 per transaction",
    serviceLevel: [
      "Everything in Growth",
      "Full premium modules and controls",
      "Priority SLA-grade support"
    ],
    support: "Priority support handling + in-app support",
    checkoutAccess: "Gateway checkout only (WhatsApp completion disabled)",
    dashboardAccess: "All modules unlocked (Automation, Intelligence, Ops, Analytics, Surveys)",
    commerceMode: "Own, Dropship, and Hybrid modes"
  }
};

const formatUsageKey = (key: string) => key.replace(/([A-Z])/g, " $1").trim();

const getUsageLabel = (key: string, role: "developer" | "business" | "creator") => {
  if (role === "business") {
    if (key === "teamMembers") return "Team members";
    if (key === "customers") return "Customer profiles";
    if (key === "notifications") return "Notifications (24h)";
  }
  if (role === "developer") {
    if (key === "apiCalls") return "API calls (month)";
    if (key === "teamMembers") return "Team members";
  }
  if (role === "creator") {
    if (key === "postsPerMonth") return "Posts created (month)";
    if (key === "scheduledPosts") return "Scheduled posts";
    if (key === "mediaUploads") return "Media uploads";
    if (key === "socialAccounts") return "Social accounts";
    if (key === "teamMembers") return "Team members";
  }
  return formatUsageKey(key);
};

const getUsageHint = (key: string, role: "developer" | "business" | "creator") => {
  if (role === "business") {
    if (key === "teamMembers") return "Total users currently in your organization.";
    if (key === "customers") return "Customer records stored in your workspace.";
    if (key === "notifications") return "Notifications sent in the last 24 hours.";
  }
  if (role === "developer" && key === "apiCalls") {
    return "Request count tracked for the current billing month.";
  }
  if (role === "creator" && key === "postsPerMonth") {
    return "Posts created in the current billing month.";
  }
  return "";
};

const getUsagePriority = (key: string, role: "developer" | "business" | "creator") => {
  if (role === "business") {
    if (key === "teamMembers") return 1;
    if (key === "customers") return 2;
    if (key === "notifications") return 3;
    return 20;
  }
  if (role === "developer") {
    if (key === "apiCalls") return 1;
    if (key === "apiKeys") return 2;
    if (key === "webhooks") return 3;
    if (key === "teamMembers") return 4;
    if (key === "notifications") return 5;
    return 20;
  }
  if (key === "postsPerMonth") return 1;
  if (key === "scheduledPosts") return 2;
  if (key === "socialAccounts") return 3;
  if (key === "mediaUploads") return 4;
  if (key === "teamMembers") return 5;
  return 20;
};

const shouldShowUsageMetric = (key: string, role: "developer" | "business" | "creator") => {
  if (role === "developer") {
    return !["customers", "socialAccounts", "postsPerMonth", "scheduledPosts", "mediaUploads"].includes(key);
  }
  if (role === "creator") {
    return !["apiKeys", "apiCalls", "webhooks", "notifications", "customers"].includes(key);
  }
  return !["apiKeys", "apiCalls", "webhooks", "socialAccounts", "postsPerMonth", "scheduledPosts", "mediaUploads"].includes(key);
};

/** Normalize legacy plan IDs to canonical names */
const normalizeDisplayPlanId = (planId: string): string => {
  const normalized = String(planId || "").trim().toLowerCase();
  if (normalized === "professional") return "growth";
  if (normalized === "enterprise" || normalized === "pro") return "scale";
  return normalized;
};

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
  const [supportEmail, setSupportEmail] = useState<string>("");
  // Payment link state — shown when the backend says "pay first"
  const [pendingPaymentLink, setPendingPaymentLink] = useState<string | null>(null);
  const [pendingPlanName, setPendingPlanName] = useState<string>("");

  // Use external currentPlan if provided, otherwise use internal state
  const currentPlan = externalCurrentPlan !== undefined ? externalCurrentPlan : internalCurrentPlan;
  const setCurrentPlan = externalCurrentPlan !== undefined ? onPlanChange || (() => {}) : setInternalCurrentPlan;

  useEffect(() => {
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
        apiRequest<{ plans: Plan[]; supportEmail?: string }>(`/billing/plans?role=${role}`, { accessToken }),
        apiRequest<{ usage: Usage; planId: string }>("/billing/usage", { accessToken }),
        apiRequest<{ invoices: Invoice[] }>("/billing/invoices", { accessToken }),
      ]);

      setPlans(plansRes.plans);
      setSupportEmail(String(plansRes.supportEmail || "").trim().toLowerCase());
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
    setPendingPaymentLink(null);

    try {
      const response: any = await apiRequest("/billing/change-plan", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { planId },
      });

      // ─── Case 1: Backend returned a payment link → user must pay first ───
      if (response.requiresPayment && response.paymentLink) {
        const plan = plans.find(p => p.id === planId);
        setPendingPaymentLink(response.paymentLink);
        setPendingPlanName(plan?.name || planId);
        setSuccess("");
        // Don't update current plan yet — it's still pending payment
        return;
      }

      // ─── Case 2: Payment was processed immediately (saved card) ───
      if (response.paymentProcessed) {
        setCurrentPlan(planId);
        setSuccess(`Successfully upgraded to ${response.subscription?.planId || planId} plan! Payment processed.`);
        fetchBillingData();
        if (onPlanChange) onPlanChange(planId);
        if (onPlanUpdated) onPlanUpdated();
        return;
      }

      // ─── Case 3: Free plan change (no payment needed) ───
      setCurrentPlan(planId);
      setSuccess(`Successfully ${planId === "free" ? "downgraded" : "upgraded"} to ${planId} plan!`);
      fetchBillingData();
      if (onPlanChange) onPlanChange(planId);
      if (onPlanUpdated) onPlanUpdated();
    } catch (err: any) {
      // ─── Case 4: 402 — payment required but charge failed ───
      const responseData = err?.response?.data;
      if (responseData?.requiresPayment && responseData?.paymentLink) {
        const plan = plans.find(p => p.id === planId);
        setPendingPaymentLink(responseData.paymentLink);
        setPendingPlanName(plan?.name || planId);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to change plan");
    } finally {
      setUpgrading(null);
    }
  };

  const handleGoToPayment = () => {
    if (pendingPaymentLink) {
      window.open(pendingPaymentLink, "_blank", "noopener,noreferrer");
    }
  };

  const handlePaymentComplete = () => {
    setPendingPaymentLink(null);
    setPendingPlanName("");
    setSuccess("Payment submitted! Your plan will be activated once the payment is confirmed.");
    fetchBillingData();
    if (onPlanUpdated) onPlanUpdated();
  };

  const formatUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toLocaleString();
  };

  const formatCurrencyAmount = (amount: number, currency?: string) => {
    const safeCurrency = currency || "USD";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: safeCurrency,
        minimumFractionDigits: safeCurrency === "NGN" ? 0 : 2,
        maximumFractionDigits: safeCurrency === "NGN" ? 0 : 2,
      }).format(amount);
    } catch {
      return `${safeCurrency} ${amount.toLocaleString()}`;
    }
  };

  const getPlanHighlights = (plan: Plan) => {
    const highlights: string[] = [`Team: ${formatLimit(plan.limits.teamMembers)}`];
    if (role === "business" && typeof plan.limits.customers === "number") {
      highlights.push(`Customers: ${formatLimit(plan.limits.customers)}`);
    }
    if (role === "developer" && typeof plan.limits.apiCalls === "number") {
      highlights.push(`API calls: ${formatLimit(plan.limits.apiCalls)}`);
    }
    if (role === "creator" && typeof plan.limits.socialAccounts === "number") {
      highlights.push(`Accounts: ${formatLimit(plan.limits.socialAccounts)}`);
    }
    return highlights.slice(0, 2);
  };

  const displayedPlans = useMemo(() => {
    if (role !== "business") return plans;

    // Normalize plan IDs and deduplicate (professional → growth, enterprise → scale)
    const normalizedPlans = plans.map((plan) => ({
      ...plan,
      id: normalizeDisplayPlanId(plan.id)
    }));

    const dedupedPlans = Array.from(
      normalizedPlans.reduce((acc, plan) => {
        if (!acc.has(plan.id)) {
          acc.set(plan.id, plan);
        }
        return acc;
      }, new Map<string, Plan>()).values()
    );

    return dedupedPlans
      .filter((plan) => BUSINESS_PLAN_ORDER.includes(plan.id))
      .sort((a, b) => BUSINESS_PLAN_ORDER.indexOf(a.id) - BUSINESS_PLAN_ORDER.indexOf(b.id))
      .map((plan) => {
        const tierMeta = BUSINESS_TIER_META[plan.id];
        if (!tierMeta) return plan;
        return {
          ...plan,
          name: tierMeta.displayName,
          description: tierMeta.goal
        };
      });
  }, [plans, role]);

  const businessBillingCurrency = useMemo(() => {
    if (role !== "business") return "USD";
    const raw = String(displayedPlans[0]?.currency || plans[0]?.currency || "USD").trim().toUpperCase();
    return raw === "NGN" ? "NGN" : "USD";
  }, [displayedPlans, plans, role]);

  const getBusinessFeeDisplay = (planId: string) => {
    const isLocal = businessBillingCurrency === "NGN";
    const normalized = normalizeDisplayPlanId(planId);
    if (normalized === "starter" || normalized === "free") {
      return {
        title: "Debby Transaction Fee",
        fee: "0%",
        cap: ""
      };
    }
    if (normalized === "growth") {
      return isLocal
        ? { title: "Debby Transaction Fee (Local)", fee: "0.50% per transaction", cap: "Cap: NGN 2,000 per transaction" }
        : { title: "Debby Transaction Fee (International)", fee: "0.75% per transaction", cap: "" };
    }
    if (normalized === "scale") {
      return isLocal
        ? { title: "Debby Transaction Fee (Local)", fee: "0.25% per transaction", cap: "Cap: NGN 1,000 per transaction" }
        : { title: "Debby Transaction Fee (International)", fee: "0.40% per transaction", cap: "" };
    }
    return {
      title: "Debby Transaction Fee",
      fee: "0%",
      cap: ""
    };
  };

  const getBusinessCheckoutPolicy = (planId: string) => {
    const normalized = normalizeDisplayPlanId(planId);
    if (normalized === "growth" || normalized === "scale") {
      return "Gateway checkout only";
    }
    return "Gateway + optional WhatsApp";
  };

  const getBusinessOperationalLimits = (plan: Plan) => {
    const rows: Array<{ label: string; value: string }> = [];
    rows.push({ label: "Team members", value: formatLimit(plan.limits.teamMembers) });
    if (typeof plan.limits.customers === "number") {
      rows.push({ label: "Customer profiles", value: formatLimit(plan.limits.customers) });
    }
    if (typeof plan.limits.notifications === "number") {
      rows.push({ label: "Daily notifications", value: formatLimit(plan.limits.notifications) });
    }
    return rows;
  };

  const getBusinessSupportDisplay = (planId: string, tierSupport: string) => {
    const normalized = normalizeDisplayPlanId(planId);
    const emailSuffix = supportEmail ? ` (${supportEmail})` : "";
    if (normalized === "starter") {
      return `Email support only${emailSuffix}`;
    }
    return `${tierSupport}${emailSuffix}`;
  };

  // Normalize the current plan for comparison
  const normalizedCurrentPlan = normalizeDisplayPlanId(currentPlan);
  const currentPlanPrice = plans.find((plan) => normalizeDisplayPlanId(plan.id) === normalizedCurrentPlan)?.price || 0;

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

      {/* ─── Payment Required Banner ─── */}
      {pendingPaymentLink && (
        <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <FiCreditCard className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div className="flex-1">
              <h4 className="text-base font-semibold text-blue-900">
                Complete payment to activate {pendingPlanName}
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Your plan upgrade requires payment. Click the button below to complete the payment through our secure payment gateway.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGoToPayment}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <FiExternalLink className="h-4 w-4" />
                  Pay Now
                </button>
                <button
                  onClick={handlePaymentComplete}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <FiCheck className="h-4 w-4" />
                  I've completed payment
                </button>
                <button
                  onClick={() => {
                    setPendingPaymentLink(null);
                    setPendingPlanName("");
                  }}
                  className="text-sm text-blue-500 hover:text-blue-700 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <>
          {role === "business" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Billing currency: <span className="font-semibold">{businessBillingCurrency}</span>
            </div>
          )}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayedPlans.map((plan) => {
            const tierMeta = role === "business" ? BUSINESS_TIER_META[plan.id] : null;
            const feeDisplay = role === "business" ? getBusinessFeeDisplay(plan.id) : null;
            const isPlanCurrent = normalizedCurrentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 sm:p-6 ${
                  isPlanCurrent
                    ? "border-emerald-400 shadow-emerald-100/80"
                    : plan.popular
                    ? "border-cyan-400 shadow-cyan-100/80"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    isPlanCurrent
                      ? "bg-emerald-400"
                      : plan.popular
                      ? "bg-cyan-500"
                      : "bg-slate-300"
                  }`}
                />
                {isPlanCurrent && (
                  <div className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Current
                  </div>
                )}
                {plan.popular && !isPlanCurrent && (
                  <div className="absolute right-4 top-4 rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                    Recommended
                  </div>
                )}

                <div className="mb-5 mt-3">
                  {tierMeta?.tierLabel && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {tierMeta.tierLabel}
                    </p>
                  )}
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrencyAmount(plan.price, plan.currency)}
                  </p>
                  <p className="text-sm text-slate-500">per {plan.interval}</p>
                </div>

                {tierMeta && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {feeDisplay?.title || "Debby Transaction Fee"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{feeDisplay?.fee || "0%"}</p>
                    {feeDisplay?.cap ? <p className="mt-1 text-xs text-slate-500">{feeDisplay.cap}</p> : null}
                  </div>
                )}

                <div className="mb-5 grid grid-cols-1 gap-2">
                  {getPlanHighlights(plan).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>

                {role === "business" && (
                  <div className="mb-5 grid grid-cols-1 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      Billing currency: <span className="font-semibold">{businessBillingCurrency}</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      Billing region: <span className="font-semibold">{businessBillingCurrency === "NGN" ? "Local (Nigeria)" : "International"}</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      Checkout policy: <span className="font-semibold">{getBusinessCheckoutPolicy(plan.id)}</span>
                    </div>
                    {supportEmail ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        Support contact: <span className="font-semibold">{supportEmail}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {tierMeta?.serviceLevel?.length ? (
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Service Level
                    </p>
                    <ul className="space-y-2">
                      {tierMeta.serviceLevel.map((service) => (
                        <li key={service} className="flex items-start gap-2 text-sm text-slate-600">
                          <FiCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {role === "business" && tierMeta ? (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Access Details
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li>
                        Support: <span className="font-semibold">{getBusinessSupportDisplay(plan.id, tierMeta.support)}</span>
                      </li>
                      <li>
                        Checkout: <span className="font-semibold">{tierMeta.checkoutAccess}</span>
                      </li>
                      <li>
                        Dashboard modules: <span className="font-semibold">{tierMeta.dashboardAccess}</span>
                      </li>
                      <li>
                        Commerce mode: <span className="font-semibold">{tierMeta.commerceMode}</span>
                      </li>
                    </ul>
                  </div>
                ) : null}

                {role === "business" ? (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Operational Limits
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {getBusinessOperationalLimits(plan).map((row) => (
                        <li key={row.label} className="flex items-center justify-between gap-3">
                          <span>{row.label}</span>
                          <span className="font-semibold">{row.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {role !== "business" && (
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <FiCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={isPlanCurrent || upgrading !== null}
                  className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isPlanCurrent
                      ? "cursor-default bg-slate-100 text-slate-400"
                      : plan.popular
                      ? "bg-cyan-600 text-white hover:bg-cyan-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {upgrading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </span>
                  ) : isPlanCurrent ? (
                    "Current Plan"
                  ) : plan.price > currentPlanPrice ? (
                    "Upgrade"
                  ) : (
                    "Downgrade"
                  )}
                </button>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && usage && (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(usage)
            .filter(([key]) => shouldShowUsageMetric(key, role))
            .sort(([a], [b]) => getUsagePriority(a, role) - getUsagePriority(b, role))
            .map(([key, value]) => {
            const metric = value as { used: number; limit: number };
            const percent = formatUsagePercent(metric.used, metric.limit);
            const isUnlimited = metric.limit === -1;
            const isAtLimit = !isUnlimited && metric.used >= metric.limit;
            const isApproaching = !isUnlimited && percent >= 50 && percent < 100;
            const label = getUsageLabel(key, role);
            const hint = getUsageHint(key, role);
            
            return (
              <div key={key} className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 ${
                isAtLimit ? "ring-2 ring-red-400" : isApproaching && percent >= 80 ? "ring-2 ring-orange-300" : ""
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    {label}
                  </h4>
                  <span className={`text-sm font-medium ${
                    isAtLimit ? "text-red-600" : isApproaching && percent >= 80 ? "text-orange-600" : "text-gray-500"
                  }`}>
                    {metric.used.toLocaleString()} / {formatLimit(metric.limit)}
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
                    style={{ width: `${isUnlimited ? 100 : Math.min(percent, 100)}%` }}
                  />
                </div>

                {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
                
                {/* Warning Messages */}
                {isAtLimit ? (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      You've hit your limit!
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Kindly upgrade your plan to get more {label.toLowerCase()}.
                    </p>
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
                  return null;
                }
                if (role === "developer" && key === "customers") {
                  return null;
                }
                if (role === "business" && ["apiKeys", "apiCalls", "webhooks", "socialAccounts", "postsPerMonth", "scheduledPosts", "mediaUploads"].includes(key)) {
                  return null;
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

  const filteredUsage = Object.entries(usage)
    .filter(([key]) => shouldShowUsageMetric(key, role))
    .sort(([a], [b]) => getUsagePriority(a, role) - getUsagePriority(b, role));

  // Check if any usage is at or approaching limit
  const hasLimitIssues = filteredUsage.some(([, v]) => {
    const metric = v as { used: number; limit: number };
    const percent = formatPercent(metric.used, metric.limit);
    return metric.limit !== -1 && percent >= 50;
  });

  return (
    <div className="space-y-3">
      {filteredUsage.slice(0, 3).map(([key, value]) => {
        const metric = value as { used: number; limit: number };
        const percent = formatPercent(metric.used, metric.limit);
        const isUnlimited = metric.limit === -1;
        const isAtLimit = !isUnlimited && metric.used >= metric.limit;
        const isApproaching = !isUnlimited && percent >= 50;
        const label = getUsageLabel(key, role);
        
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`${
                isAtLimit ? "text-red-600 font-medium" : 
                isApproaching && percent >= 80 ? "text-orange-600" : 
                "text-gray-600"
              }`}>
                {label}
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
                style={{ width: `${isUnlimited ? 100 : Math.min(percent, 100)}%` }}
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
