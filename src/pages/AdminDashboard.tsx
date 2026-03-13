import React, { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend as ChartLegend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { FiAlertTriangle, FiBarChart2, FiCreditCard, FiDollarSign, FiInfo, FiLogOut, FiMenu, FiMessageSquare, FiRefreshCw, FiSettings, FiShield, FiUsers } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAdminAuth } from "../auth/AdminAuthProvider";
import { Sidebar } from "../components/Sidebar";
import { ConfirmModal } from "../components/Modal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartTooltip,
  ChartLegend,
  Filler
);

type AdminTab = "overview" | "payments" | "revenue" | "risk" | "ops" | "support" | "reliability" | "audit" | "access";
type FxPayload = {
  reportingCurrency: string;
  source: "live" | "fallback" | string;
  fetchedAt: string | null;
  rates?: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    fetchedAt: string | null;
    source: "live" | "fallback" | string;
  }>;
};
type Overview = { metrics: any; trends: { revenueByDay: Array<{ date: string; amount: number }> }; leaders: any; fx?: FxPayload };
type Health = { attempts: number; successRate: number; declineRate: number; refundAndChargebackRate: number; fraudFlags: number; avgPaymentApiLatencyMs: number };
type PaymentProvider = "paystack" | "stripe";
type RevenueChartType = "bar" | "line";
type CmdConfig = { providerPriority: PaymentProvider[]; fallbackEnabled: boolean; platformFeePercent: number; fixedFeeMinor: number; settlementSchedule: "daily" | "weekly" | "manual" };
type GatewayConfig = { id: string; provider: PaymentProvider; status: string; isActive: boolean; secretKeyMasked: string; webhookSecretMasked: string | null; lastValidationOk: boolean | null; createdAt: string; updatedAt: string };
type GatewayVersion = { id: string; provider: "stripe" | "paystack"; status: string; isActive: boolean; reason: string | null; createdAt: string };
type FeePolicyRow = {
  id: string;
  planId: string;
  provider: "stripe" | "paystack";
  currency: string;
  isLocal: boolean;
  percentBps: number;
  capAmount: number | null;
  isActive: boolean;
  priority: number;
  notes?: string | null;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
};
type FeePolicyVersion = {
  id: string;
  policyId: string;
  version: number;
  planId: string;
  provider: "stripe" | "paystack";
  currency: string;
  isLocal: boolean;
  percentBps: number;
  capAmount: number | null;
  isActive: boolean;
  priority: number;
  notes?: string | null;
  changedByAdminId?: string | null;
  reason?: string | null;
  createdAt: string;
};
type RoleRow = { userId: string; email: string; firstName?: string | null; lastName?: string | null; roles: string[] };
type PlatformUserRow = {
  id: string;
  email: string;
  role: "developer" | "business" | "creator" | "admin";
  teamRole: "owner" | "admin" | "member" | "viewer";
  orgId: string;
  orgName: string;
  createdAt: string;
  shopCount: number;
  planId?: string;
  subscriptionStatus?: string;
};
type LiveSnapshot = { at: string; payments: { attemptsLastHour: number; successRateLastHour: number; failureRateLastHour: number }; ops: { notificationLag: number; unresolvedFraudFlags: number } };
type WaitlistEntry = { id: string; email: string; createdAt: string; updatedAt: string };
type BookDemoRequestEntry = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  roleTitle?: string | null;
  country?: string | null;
  website?: string | null;
  monthlyVolume?: string | null;
  message?: string | null;
  status: string;
  contactedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
type BusinessOwnerRow = {
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  orgId: string;
  businessName: string;
  tier: string;
  subscriptionStatus: string;
  countryCode: string | null;
  billingCurrency: "NGN" | "USD";
  mrr: number;
  arr: number;
  gmv: number;
  paidOrders: number;
  grossProcessed: number;
  merchantIncome: number;
  debbyFeeRevenue: number;
  splitStatus: string;
};
type SplitHealthRow = {
  orgId: string;
  businessName: string;
  ownerEmail: string | null;
  ownerName: string | null;
  planId: string;
  subscriptionStatus: string;
  providers: {
    stripe: { hasToken: boolean; splitCapable: boolean };
    paystack: { hasToken: boolean; splitCapable: boolean };
  };
  splitReadyProviders: Array<"stripe" | "paystack">;
  splitReady: boolean;
};
type SplitHealth = {
  windowDays: number;
  summary: {
    paidTierMerchants: number;
    splitReadyMerchants: number;
    splitMissingMerchants: number;
    blockedCheckouts: number;
  };
  merchants: SplitHealthRow[];
};
type BusinessOwnerDetails = {
  windowDays: number;
  owner: {
    ownerId: string;
    ownerEmail: string;
    ownerName: string | null;
    orgId: string;
    businessName: string;
  };
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string | null;
    mrr: number;
    arr: number;
    billingCurrency: "NGN" | "USD";
    sourceBillingCurrency?: string;
    countryCode: string | null;
  };
  splitConnections: Array<{
    provider: string;
    splitCapable: boolean;
    connectionStatus: string;
    isActive: boolean;
    lastValidatedAt: string | null;
    lastValidationOk: boolean | null;
    lastValidationMsg: string | null;
  }>;
  ledgerSummary: {
    currency: string;
    gross: number;
    platformFeeRevenue: number;
    merchantNetIncome: number;
    refunds: number;
    chargebacks: number;
    byCurrency?: Array<{
      currency: string;
      sourceCurrency?: string;
      gross: number;
      platformFeeRevenue: number;
      merchantNetIncome: number;
      refunds: number;
      chargebacks: number;
    }>;
  };
  transactionSummary?: {
    currency: string;
    successfulPayments: number;
    grossProcessed: number;
    platformFeeRevenue: number;
    merchantNetIncome: number;
    paidOrdersCount: number;
    paidOrdersTotal: number;
    byCurrency?: Array<{
      currency: string;
      sourceCurrency?: string;
      successfulPayments: number;
      grossProcessed: number;
      platformFeeRevenue: number;
      merchantNetIncome: number;
      paidOrdersCount: number;
      paidOrdersTotal: number;
    }>;
  };
  ledger: Array<{
    id: string;
    eventType: string;
    provider: string;
    providerReference: string | null;
    planId: string | null;
    currency: string;
    sourceCurrency?: string;
    grossAmount: number;
    platformFeeAmount: number;
    merchantNetAmount: number;
    gatewayFeeAmount: number;
    occurredAt: string;
  }>;
  disputesAndRefunds: Array<{
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    sourceCurrency?: string;
    gatewayProvider: string | null;
    gatewayReference: string | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
  fx?: FxPayload;
};
type AdminSupportTicketListItem = {
  id: string;
  orgId: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
  org: { id: string; name: string } | null;
  messageCount: number;
  lastMessage: { id: string; senderType: string; message: string; createdAt: string } | null;
};
type AdminSupportTicketDetails = {
  id: string;
  orgId: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
  org: { id: string; name: string } | null;
  messages: Array<{ id: string; senderType: string; senderId?: string | null; message: string; createdAt: string }>;
};
type EntitlementMatrix = {
  generatedAt: string;
  summary: {
    totalRoutes: number;
    coreRoutes: number;
    featureRoutes: number;
    guardedRoutes: number;
    unguardedRoutes: number;
    featureRoutesOutsideGuardChain: number;
  };
  routes: Array<{
    method: string;
    path: string;
    sourceLine: number;
    protectedByBusinessGuardChain: boolean;
    feature: string;
  }>;
};

type SupportEmailConfig = {
  supportEmail: string | null;
  updatedAt: string | null;
};

type AdminHomepageReview = {
  id: string;
  orgId: string;
  org: { id: string; name: string } | null;
  submittedByUserId: string;
  submittedByUser: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  displayName: string;
  roleTitle: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected" | "hidden";
  moderationNote?: string | null;
  moderatedByUserId?: string | null;
  moderatedByUser?: { id: string; email: string } | null;
  approvedAt?: string | null;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminHomepageReviewsPayload = {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    hidden: number;
  };
  reviews: AdminHomepageReview[];
};

const defaultCmdConfig: CmdConfig = { providerPriority: ["paystack", "stripe"], fallbackEnabled: true, platformFeePercent: 2.5, fixedFeeMinor: 0, settlementSchedule: "daily" };
const fallbackProviderOrder: PaymentProvider[] = ["paystack", "stripe"];
const money = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v || 0);
const moneyInCurrency = (v: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(
    v || 0
  );
const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);
const parseFxTime = (value: string | null | undefined) => {
  const t = value ? Date.parse(value) : NaN;
  return Number.isFinite(t) ? t : 0;
};
const pickFreshFx = (a: FxPayload | null | undefined, b: FxPayload | null | undefined): FxPayload | null => {
  if (!a && !b) return null;
  if (!a) return b || null;
  if (!b) return a;
  const ta = parseFxTime(a.fetchedAt);
  const tb = parseFxTime(b.fetchedAt);
  if (tb > ta) return b;
  if (ta > tb) return a;
  if (a.source !== "live" && b.source === "live") return b;
  return a;
};
const toProviderLabel = (provider: PaymentProvider) => provider === "paystack" ? "Paystack" : "Stripe";
const toCanonicalPlanId = (planId: string) => {
  const normalized = String(planId || "").trim().toLowerCase();
  if (normalized === "professional") return "growth";
  if (normalized === "enterprise" || normalized === "pro") return "scale";
  return normalized;
};
const toPlanLabel = (planId: string) => {
  const normalized = String(planId || "").trim().toLowerCase();
  if (normalized === "growth" || normalized === "professional") return "Growth";
  if (normalized === "scale" || normalized === "enterprise" || normalized === "pro") return "Scale";
  if (normalized === "starter") return "Starter";
  if (normalized === "free") return "Free";
  return normalized || "Unknown";
};

const dedupeProviders = (providers: PaymentProvider[]) => {
  const seen = new Set<PaymentProvider>();
  const output: PaymentProvider[] = [];
  providers.forEach((provider) => {
    if (seen.has(provider)) return;
    seen.add(provider);
    output.push(provider);
  });
  return output;
};

const getConfiguredProviderOrder = (configs: GatewayConfig[]) =>
  dedupeProviders(
    [...configs]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((cfg) => cfg.provider)
  );

const normalizeCommandConfig = (input: CmdConfig | null | undefined, configuredProviderOrder: PaymentProvider[]): CmdConfig => {
  const providerPool = configuredProviderOrder.length ? configuredProviderOrder : fallbackProviderOrder;
  const requested = dedupeProviders((input?.providerPriority || []) as PaymentProvider[]).filter((provider) =>
    providerPool.includes(provider)
  );
  const ordered = dedupeProviders([...requested, ...providerPool]);
  const defaultProvider = ordered[0] || fallbackProviderOrder[0];
  const fallbackProvider = ordered.find((provider) => provider !== defaultProvider) || null;
  const providerPriority = fallbackProvider ? [defaultProvider, fallbackProvider] : [defaultProvider];
  const fallbackEnabled = providerPriority.length > 1 ? (typeof input?.fallbackEnabled === "boolean" ? input.fallbackEnabled : true) : false;
  const nextPlatformFeePercent = Number(input?.platformFeePercent);
  const nextFixedFeeMinor = Number(input?.fixedFeeMinor);
  const settlementSchedule = input?.settlementSchedule && ["daily", "weekly", "manual"].includes(input.settlementSchedule)
    ? input.settlementSchedule
    : defaultCmdConfig.settlementSchedule;

  return {
    providerPriority,
    fallbackEnabled,
    platformFeePercent: Number.isFinite(nextPlatformFeePercent) ? nextPlatformFeePercent : defaultCmdConfig.platformFeePercent,
    fixedFeeMinor: Number.isFinite(nextFixedFeeMinor) ? Math.max(0, Math.round(nextFixedFeeMinor)) : defaultCmdConfig.fixedFeeMinor,
    settlementSchedule
  };
};

type MetricPoint = {
  label: string;
  value: number;
};

const MetricSwitchChart = ({
  data,
  chartType,
  color,
  valueFormatter
}: {
  data: MetricPoint[];
  chartType: RevenueChartType;
  color: { line: string; fill: string; bar: string };
  valueFormatter: (value: number) => string;
}) => {
  if (!data.length) {
    return <div className="h-56 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">No data</div>;
  }
  const labels = data.map((point) => point.label);
  const values = data.map((point) => point.value);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => valueFormatter(Number(context?.parsed?.y ?? context?.parsed ?? 0))
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.42)" },
        ticks: { color: "#94a3b8", font: { size: 11, weight: 500 as const } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(31, 41, 55, 0.72)" },
        ticks: {
          color: "#64748b",
          font: { size: 11, weight: 500 as const },
          callback: (value: number | string) => valueFormatter(Number(value || 0))
        }
      }
    }
  };
  const barData = {
    labels,
    datasets: [
      {
        label: "Value",
        data: values,
        backgroundColor: color.bar,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 42,
        categoryPercentage: 0.78
      }
    ]
  };
  const lineData = {
    labels,
    datasets: [
      {
        label: "Value",
        data: values,
        fill: true,
        borderColor: color.line,
        backgroundColor: color.fill,
        pointBackgroundColor: color.line,
        pointBorderColor: "#0f172a",
        pointBorderWidth: 1.6,
        pointRadius: 3.2,
        pointHoverRadius: 4.8,
        tension: 0.34,
        borderWidth: 2.4
      }
    ]
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-2">
      <div className="h-56">
        {chartType === "line" ? (
          <Line data={lineData} options={options} />
        ) : (
          <Bar data={barData} options={options} />
        )}
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { accessToken, csrfToken, user, logout } = useAdminAuth();
  const darkInputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/60";
  const darkSelectClass = `${darkInputClass} appearance-none [color-scheme:dark]`;
  const chartSelectClass = "rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/60 [color-scheme:dark]";
  const denseTableScopeClass =
    "[&_table_th]:whitespace-nowrap [&_table_td]:whitespace-nowrap [&_table_th]:px-3 [&_table_td]:px-3 [&_table_th]:py-2 [&_table_td]:py-2";
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth < 640);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [modules, setModules] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<GatewayConfig[]>([]);
  const [platformVersions, setPlatformVersions] = useState<GatewayVersion[]>([]);
  const [feePolicies, setFeePolicies] = useState<FeePolicyRow[]>([]);
  const [feePolicyVersions, setFeePolicyVersions] = useState<FeePolicyVersion[]>([]);
  const [adminRoles, setAdminRoles] = useState<RoleRow[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUserRow[]>([]);
  const [platformUserPlanDrafts, setPlatformUserPlanDrafts] = useState<Record<string, string>>({});
  const [updatingPlatformUserPlanId, setUpdatingPlatformUserPlanId] = useState<string | null>(null);
  const [deletingPlatformUserId, setDeletingPlatformUserId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<PlatformUserRow | null>(null);
  const [supportEmailConfig, setSupportEmailConfig] = useState<SupportEmailConfig>({ supportEmail: null, updatedAt: null });
  const [supportEmailForm, setSupportEmailForm] = useState("");
  const [savingSupportEmail, setSavingSupportEmail] = useState(false);
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [bookDemoRequests, setBookDemoRequests] = useState<BookDemoRequestEntry[]>([]);
  const [businessOwners, setBusinessOwners] = useState<BusinessOwnerRow[]>([]);
  const [selectedOwnerDetails, setSelectedOwnerDetails] = useState<BusinessOwnerDetails | null>(null);
  const [splitHealth, setSplitHealth] = useState<SplitHealth | null>(null);
  const [supportTickets, setSupportTickets] = useState<AdminSupportTicketListItem[]>([]);
  const [supportStatusFilter, setSupportStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<AdminSupportTicketDetails | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportReply, setSupportReply] = useState("");
  const [sendingSupportReply, setSendingSupportReply] = useState(false);
  const [updatingSupportStatus, setUpdatingSupportStatus] = useState(false);
  const [homepageReviews, setHomepageReviews] = useState<AdminHomepageReview[]>([]);
  const [homepageReviewSummary, setHomepageReviewSummary] = useState<AdminHomepageReviewsPayload["summary"] | null>(null);
  const [homepageReviewStatusFilter, setHomepageReviewStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "hidden"
  >("pending");
  const [moderatingHomepageReviewId, setModeratingHomepageReviewId] = useState<string | null>(null);
  const [entitlementMatrix, setEntitlementMatrix] = useState<EntitlementMatrix | null>(null);
  const [activeProvider, setActiveProvider] = useState<"stripe" | "paystack" | null>(null);
  const [commandConfig, setCommandConfig] = useState<CmdConfig>(defaultCmdConfig);
  const [mrrChartType, setMrrChartType] = useState<RevenueChartType>("bar");
  const [arrChartType, setArrChartType] = useState<RevenueChartType>("bar");
  const [fxStatus, setFxStatus] = useState<FxPayload | null>(null);
  const [platformForm, setPlatformForm] = useState({ provider: "paystack" as "stripe" | "paystack", secretKey: "", publicKey: "", webhookSecret: "" });
  const [feePolicyForm, setFeePolicyForm] = useState({
    planId: "professional",
    provider: "paystack" as "stripe" | "paystack",
    currency: "NGN",
    isLocal: true,
    percentBps: 50,
    capAmount: 2000,
    isActive: true,
    priority: 0,
    notes: "",
    reason: ""
  });
  const [roleForm, setRoleForm] = useState({ userId: "", role: "support_admin" });

  useEffect(() => {
    setPlatformUserPlanDrafts((prev) => {
      const next = { ...prev };
      platformUsers.forEach((row) => {
        if (row.role !== "business") return;
        if (!next[row.id]) {
          next[row.id] = toCanonicalPlanId(row.planId || "free");
        }
      });
      Object.keys(next).forEach((userId) => {
        if (!platformUsers.some((row) => row.id === userId && row.role === "business")) {
          delete next[userId];
        }
      });
      return next;
    });
  }, [platformUsers]);

  const supportNotificationCount = useMemo(() => {
    const moduleCount = Number(modules?.merchantOps?.supportSla?.openOrInProgress);
    if (Number.isFinite(moduleCount) && moduleCount > 0) return moduleCount;
    return supportTickets.filter((ticket) => ticket.status === "open" || ticket.status === "in_progress").length;
  }, [modules, supportTickets]);
  const supportNotificationBadge =
    supportNotificationCount > 0 ? (supportNotificationCount > 99 ? "99+" : String(supportNotificationCount)) : undefined;
  const tabs = useMemo(() => [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "payments", label: "Payments", icon: <FiCreditCard /> },
    { id: "revenue", label: "Revenue", icon: <FiDollarSign /> },
    { id: "risk", label: "Risk", icon: <FiAlertTriangle /> },
    { id: "ops", label: "Merchant Ops", icon: <FiUsers /> },
    { id: "support", label: "Support Inbox", icon: <FiMessageSquare />, badge: supportNotificationBadge },
    { id: "reliability", label: "Reliability", icon: <FiBarChart2 /> },
    { id: "audit", label: "Audit", icon: <FiSettings /> },
    { id: "access", label: "Access", icon: <FiShield /> }
  ], [supportNotificationBadge]);

  const feePoliciesForDisplay = useMemo(() => {
    const rows = new Map<string, FeePolicyRow>();
    for (const row of feePolicies) {
      const canonicalPlanId = toCanonicalPlanId(row.planId);
      const key = `${canonicalPlanId}:${row.provider}:${String(row.currency || "").toUpperCase()}:${row.isLocal ? "1" : "0"}`;
      const existing = rows.get(key);
      if (!existing) {
        rows.set(key, row);
        continue;
      }
      const existingPlan = String(existing.planId || "").toLowerCase();
      const nextPlan = String(row.planId || "").toLowerCase();
      const shouldPreferNext =
        (existingPlan === "pro" && nextPlan === "enterprise") ||
        new Date(row.updatedAt).getTime() > new Date(existing.updatedAt).getTime();
      if (shouldPreferNext) {
        rows.set(key, row);
      }
    }
    return Array.from(rows.values()).sort((a, b) => {
      const pa = toCanonicalPlanId(a.planId);
      const pb = toCanonicalPlanId(b.planId);
      if (pa !== pb) return pa.localeCompare(pb);
      if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
      if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
      return Number(b.isLocal) - Number(a.isLocal);
    });
  }, [feePolicies]);

  useEffect(() => {
    const onResize = () => { const mobile = window.innerWidth < 640; setIsMobileViewport(mobile); if (!mobile) setIsMobileSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const load = async () => {
    if (!accessToken) return;
    setLoading(true); setStatus(null);
    try {
      const base = await Promise.allSettled([
        apiRequest<Overview>("/admin/overview", { accessToken }),
        apiRequest<Health>("/admin/payments/health", { accessToken }),
        apiRequest<any>("/admin/modules", { accessToken }),
        apiRequest<{ config: CmdConfig | null }>("/admin/config/payment-gateway", { accessToken }),
        apiRequest<{ activeProvider: "stripe" | "paystack" | null; configs: GatewayConfig[] }>("/admin/platform-gateway", { accessToken })
      ]);

      if (base[0].status === "fulfilled") setOverview(base[0].value);
      if (base[1].status === "fulfilled") setHealth(base[1].value);
      if (base[2].status === "fulfilled") setModules(base[2].value);
      let nextFx = pickFreshFx(
        base[0].status === "fulfilled" ? base[0].value?.fx : null,
        base[2].status === "fulfilled" ? (base[2].value?.fx as FxPayload | undefined) : null
      );

      const loadedPlatformConfigs = base[4].status === "fulfilled" ? (base[4].value.configs || []) : [];
      if (base[4].status === "fulfilled") {
        setPlatformConfigs(loadedPlatformConfigs);
        setActiveProvider(base[4].value.activeProvider || null);
      }

      const loadedConfig = base[3].status === "fulfilled" ? (base[3].value.config || null) : null;
      setCommandConfig(normalizeCommandConfig(loadedConfig, getConfiguredProviderOrder(loadedPlatformConfigs)));

      const missingBase = base.filter((item) => item.status === "rejected").length;
      if (missingBase > 0) {
        setStatus(`Some admin modules failed to load (${missingBase}). Check backend logs/migrations.`);
      }

      const optional = await Promise.allSettled([
        apiRequest<{ logs: any[] }>("/admin/audit-logs?limit=40", { accessToken }),
        apiRequest<{ admins: RoleRow[] }>("/admin/access/roles", { accessToken }),
        apiRequest<{ users: PlatformUserRow[] }>("/admin/users?limit=300", { accessToken }),
        apiRequest<{ versions: GatewayVersion[] }>("/admin/platform-gateway/versions?limit=8", { accessToken }),
        apiRequest<LiveSnapshot>("/admin/live/snapshot", { accessToken }),
        apiRequest<{ entries: WaitlistEntry[] }>("/admin/waitlist?limit=200", { accessToken }),
        apiRequest<{ tickets: AdminSupportTicketListItem[] }>(
          `/admin/support/tickets?limit=80${supportStatusFilter === "all" ? "" : `&status=${supportStatusFilter}`}`,
          { accessToken }
        ),
        apiRequest<AdminHomepageReviewsPayload>(
          `/admin/homepage-reviews?limit=180${homepageReviewStatusFilter === "all" ? "" : `&status=${homepageReviewStatusFilter}`}`,
          { accessToken }
        ),
        apiRequest<{ owners: BusinessOwnerRow[] }>("/admin/business-owners?limit=200&days=30&fresh=1", { accessToken }),
        apiRequest<SplitHealth>("/admin/payments/split-health?days=30", { accessToken }),
        apiRequest<{ policies: FeePolicyRow[]; versions: FeePolicyVersion[] }>("/admin/fee-policies", { accessToken }),
        apiRequest<EntitlementMatrix>("/admin/access/entitlements/matrix", { accessToken }),
        apiRequest<SupportEmailConfig>("/admin/config/support-email", { accessToken }),
        apiRequest<{ entries: BookDemoRequestEntry[] }>("/admin/book-demo-requests?limit=200", { accessToken })
      ]);
      if (optional[0].status === "fulfilled") {
        setAuditLogs(optional[0].value.logs || []);
      } else {
        setAuditLogs([]);
      }
      if (optional[1].status === "fulfilled") {
        const rows = optional[1].value.admins || [];
        setAdminRoles(rows);
        setRoleForm((prev) => ({
          ...prev,
          userId: prev.userId || rows[0]?.userId || ""
        }));
      } else {
        setAdminRoles([]);
      }
      if (optional[2].status === "fulfilled") {
        setPlatformUsers(optional[2].value.users || []);
      } else {
        setPlatformUsers([]);
      }
      if (optional[3].status === "fulfilled") {
        setPlatformVersions(optional[3].value.versions || []);
      } else {
        setPlatformVersions([]);
      }
      if (optional[4].status === "fulfilled") {
        setLive(optional[4].value);
      }
      if (optional[5].status === "fulfilled") {
        setWaitlistEntries(optional[5].value.entries || []);
      } else {
        setWaitlistEntries([]);
      }
      if (optional[6].status === "fulfilled") {
        const tickets = optional[6].value.tickets || [];
        setSupportTickets(tickets);
        setSelectedSupportTicket((prev) => {
          if (!prev) return null;
          return tickets.find((ticket) => ticket.id === prev.id) ? prev : null;
        });
      } else {
        setSupportTickets([]);
      }
      if (optional[7].status === "fulfilled") {
        setHomepageReviews(optional[7].value.reviews || []);
        setHomepageReviewSummary(optional[7].value.summary || null);
      } else {
        setHomepageReviews([]);
        setHomepageReviewSummary(null);
      }
      if (optional[8].status === "fulfilled") {
        setBusinessOwners(optional[8].value.owners || []);
        nextFx = pickFreshFx(nextFx, (optional[8].value as any)?.fx as FxPayload | undefined);
      } else {
        setBusinessOwners([]);
      }
      if (optional[9].status === "fulfilled") {
        setSplitHealth(optional[9].value);
      } else {
        setSplitHealth(null);
      }
      if (optional[10].status === "fulfilled") {
        setFeePolicies(optional[10].value.policies || []);
        setFeePolicyVersions(optional[10].value.versions || []);
      } else {
        setFeePolicies([]);
        setFeePolicyVersions([]);
      }
      if (optional[11].status === "fulfilled") {
        setEntitlementMatrix(optional[11].value);
      } else {
        setEntitlementMatrix(null);
      }
      if (optional[12].status === "fulfilled") {
        const config = optional[12].value;
        setSupportEmailConfig(config);
        setSupportEmailForm(config.supportEmail || "");
      }
      if (optional[13].status === "fulfilled") {
        setBookDemoRequests(optional[13].value.entries || []);
      } else {
        setBookDemoRequests([]);
      }
      setFxStatus(nextFx);
    } catch (e) { setStatus((e as Error).message || "Failed to load admin dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [accessToken, supportStatusFilter, homepageReviewStatusFilter]);

  const chart = overview?.trends.revenueByDay || [];
  const overviewTrendChartData = useMemo(
    () => ({
      labels: chart.map((d) => d.date.slice(5)),
      datasets: [
        {
          label: "Revenue",
          data: chart.map((d) => Number(d.amount || 0)),
          backgroundColor: "rgba(52, 211, 153, 0.88)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 20,
          categoryPercentage: 0.78
        }
      ]
    }),
    [chart]
  );
  const overviewTrendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false as const,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => money(Number(context?.parsed?.y ?? context?.parsed ?? 0))
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10, weight: 500 as const } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(51, 65, 85, 0.45)", borderDash: [4, 4] },
          ticks: {
            color: "#64748b",
            font: { size: 10, weight: 500 as const },
            callback: (value: number | string) => compact(Number(value || 0))
          }
        }
      }
    }),
    []
  );

  const saveCommandConfig = async () => {
    if (!accessToken || !csrfToken) return;
    const normalized = normalizeCommandConfig(commandConfig, getConfiguredProviderOrder(platformConfigs));
    try {
      await apiRequest("/admin/config/payment-gateway", { method: "PUT", accessToken, csrfToken, body: normalized });
      setCommandConfig(normalized);
      setStatus("Command center saved.");
    }
    catch (e) { setStatus((e as Error).message || "Failed saving command center"); }
  };

  const savePlatformCredentials = async () => {
    if (!accessToken || !csrfToken) return;
    if (!platformForm.secretKey.trim()) return setStatus("Secret key is required.");
    try {
      await apiRequest("/admin/platform-gateway", { method: "PUT", accessToken, csrfToken, body: { provider: platformForm.provider, secretKey: platformForm.secretKey, publicKey: platformForm.publicKey || undefined, webhookSecret: platformForm.webhookSecret || undefined } });
      setPlatformForm((p) => ({ ...p, secretKey: "", webhookSecret: "" })); setStatus("Platform credentials saved."); await load();
    } catch (e) { setStatus((e as Error).message || "Failed saving platform credentials"); }
  };

  const activateProvider = async (provider: "stripe" | "paystack") => {
    if (!accessToken || !csrfToken) return;
    try { await apiRequest("/admin/platform-gateway/activate", { method: "POST", accessToken, csrfToken, body: { provider } }); setStatus(`${provider} activated.`); await load(); }
    catch (e) { setStatus((e as Error).message || `Failed activating ${provider}`); }
  };

  const testProvider = async (provider: "stripe" | "paystack") => {
    if (!accessToken || !csrfToken) return;
    const secret = platformForm.provider === provider && platformForm.secretKey.trim() ? platformForm.secretKey.trim() : undefined;
    try { const r = await apiRequest<{ message: string }>("/admin/platform-gateway/test", { method: "POST", accessToken, csrfToken, body: { provider, ...(secret ? { secretKey: secret } : {}) } }); setStatus(r.message); await load(); }
    catch (e) { setStatus((e as Error).message || `Failed testing ${provider}`); }
  };

  const rollbackVersion = async (versionId: string) => {
    if (!accessToken || !csrfToken) return;
    try {
      await apiRequest("/admin/platform-gateway/rollback", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { versionId, reason: "admin_dashboard_manual_rollback" }
      });
      setStatus("Gateway config rolled back.");
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Rollback failed");
    }
  };

  const saveFeePolicy = async () => {
    if (!accessToken || !csrfToken) return;
    try {
      const body = {
        ...feePolicyForm,
        planId: String(feePolicyForm.planId || "").trim().toLowerCase(),
        currency: String(feePolicyForm.currency || "USD").trim().toUpperCase(),
        percentBps: Number(feePolicyForm.percentBps || 0),
        capAmount:
          feePolicyForm.capAmount === null || feePolicyForm.capAmount === undefined
            ? null
            : Number(feePolicyForm.capAmount),
        priority: Number(feePolicyForm.priority || 0)
      };
      await apiRequest("/admin/fee-policies", {
        method: "POST",
        accessToken,
        csrfToken,
        body
      });
      setStatus("Fee policy saved.");
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed to save fee policy");
    }
  };

  const rollbackFeePolicyVersion = async (versionId: string) => {
    if (!accessToken || !csrfToken) return;
    try {
      await apiRequest("/admin/fee-policies/rollback", {
        method: "POST",
        accessToken,
        csrfToken,
        body: {
          versionId,
          reason: "admin_dashboard_manual_policy_rollback"
        }
      });
      setStatus("Fee policy rolled back.");
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed to rollback fee policy");
    }
  };

  const loadBusinessOwnerDetails = async (orgId: string) => {
    if (!accessToken) return;
    try {
      const response = await apiRequest<BusinessOwnerDetails>(
        `/admin/business-owners/${encodeURIComponent(orgId)}?days=90&fresh=1`,
        { accessToken }
      );
      setSelectedOwnerDetails(response);
      setFxStatus((prev) => pickFreshFx(prev, response.fx));
    } catch (e) {
      setStatus((e as Error).message || "Failed to load owner details");
    }
  };

  const assignRole = async () => {
    if (!accessToken || !csrfToken) return;
    if (!roleForm.userId) return setStatus("Select an admin user first.");
    try {
      await apiRequest("/admin/access/assign-role", {
        method: "POST",
        accessToken,
        csrfToken,
        body: roleForm
      });
      setStatus("Role assigned.");
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed assigning role");
    }
  };

  const removeRole = async () => {
    if (!accessToken || !csrfToken) return;
    if (!roleForm.userId) return setStatus("Select an admin user first.");
    try {
      await apiRequest("/admin/access/remove-role", {
        method: "DELETE",
        accessToken,
        csrfToken,
        body: roleForm
      });
      setStatus("Role removed.");
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed removing role");
    }
  };

  const refreshPlatformUsersInBackground = async () => {
    if (!accessToken) return;
    try {
      const [usersRes, ownersRes] = await Promise.all([
        apiRequest<{ users: PlatformUserRow[] }>("/admin/users?limit=300", { accessToken }),
        apiRequest<{ owners: BusinessOwnerRow[] }>("/admin/business-owners?limit=200&days=30&fresh=1", { accessToken })
      ]);
      setPlatformUsers(usersRes.users || []);
      setBusinessOwners(ownersRes.owners || []);
    } catch {
      // Keep optimistic UI if background refresh fails.
    }
  };

  const requestDeletePlatformUser = (target: PlatformUserRow) => {
    if (target.role === "admin") {
      setStatus("Admin users cannot be deleted from this table.");
      return;
    }
    setPendingDeleteUser(target);
  };

  const savePlatformUserPlan = async (target: PlatformUserRow) => {
    if (!accessToken || !csrfToken) return;
    if (target.role !== "business") {
      setStatus("Only business users can have tiers changed.");
      return;
    }
    const nextPlanId = toCanonicalPlanId(platformUserPlanDrafts[target.id] || target.planId || "free");
    const currentPlanId = toCanonicalPlanId(target.planId || "free");
    if (nextPlanId === currentPlanId) {
      setStatus("No tier change detected.");
      return;
    }

    setUpdatingPlatformUserPlanId(target.id);
    try {
      const response = await apiRequest<{ planId: string; status: string; message?: string }>(
        `/admin/users/${encodeURIComponent(target.id)}/plan`,
        {
          method: "PUT",
          accessToken,
          csrfToken,
          body: { planId: nextPlanId }
        }
      );

      const resolvedPlanId = toCanonicalPlanId(response.planId || nextPlanId);
      const resolvedStatus = String(response.status || "active");

      setPlatformUsers((prev) =>
        prev.map((row) =>
          row.id === target.id
            ? { ...row, planId: resolvedPlanId, subscriptionStatus: resolvedStatus }
            : row
        )
      );
      setBusinessOwners((prev) =>
        prev.map((row) =>
          row.orgId === target.orgId
            ? { ...row, tier: resolvedPlanId, subscriptionStatus: resolvedStatus }
            : row
        )
      );
      setPlatformUserPlanDrafts((prev) => ({ ...prev, [target.id]: resolvedPlanId }));
      setStatus(response.message || `Updated tier to ${toPlanLabel(resolvedPlanId)}.`);
      void refreshPlatformUsersInBackground();
    } catch (e) {
      setStatus((e as Error).message || "Failed to update business tier");
    } finally {
      setUpdatingPlatformUserPlanId(null);
    }
  };

  const confirmDeletePlatformUser = async () => {
    const target = pendingDeleteUser;
    if (!target) return;
    if (!accessToken || !csrfToken) return;

    setDeletingPlatformUserId(target.id);
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
        accessToken,
        csrfToken
      });
      setStatus("User and organization data deleted.");
      setPlatformUsers((prev) => prev.filter((row) => row.id !== target.id));
      setBusinessOwners((prev) => prev.filter((row) => row.orgId !== target.orgId));
      if (selectedOwnerDetails?.owner?.orgId === target.orgId) {
        setSelectedOwnerDetails(null);
      }
      setPendingDeleteUser(null);
      void refreshPlatformUsersInBackground();
    } catch (e) {
      setStatus((e as Error).message || "Failed to delete user");
    } finally {
      setDeletingPlatformUserId(null);
    }
  };

  const saveSupportEmail = async () => {
    if (!accessToken || !csrfToken) return;
    const email = supportEmailForm.trim().toLowerCase();
    if (!email) {
      setStatus("Support email is required.");
      return;
    }
    setSavingSupportEmail(true);
    try {
      const response = await apiRequest<SupportEmailConfig>("/admin/config/support-email", {
        method: "PUT",
        accessToken,
        csrfToken,
        body: { supportEmail: email }
      });
      setSupportEmailConfig(response);
      setSupportEmailForm(response.supportEmail || "");
      setStatus("Support email updated.");
    } catch (e) {
      setStatus((e as Error).message || "Failed to update support email");
    } finally {
      setSavingSupportEmail(false);
    }
  };

  const loadSupportTicketDetails = async (ticketId: string) => {
    if (!accessToken) return;
    setSupportLoading(true);
    try {
      const response = await apiRequest<{ ticket: AdminSupportTicketDetails }>(`/admin/support/tickets/${ticketId}`, { accessToken });
      setSelectedSupportTicket(response.ticket || null);
      setSupportReply("");
    } catch (e) {
      setStatus((e as Error).message || "Failed to load support ticket details");
    } finally {
      setSupportLoading(false);
    }
  };

  const sendSupportReply = async () => {
    if (!accessToken || !csrfToken || !selectedSupportTicket?.id) return;
    const message = supportReply.trim();
    if (!message) return setStatus("Reply message is required.");
    setSendingSupportReply(true);
    try {
      await apiRequest(`/admin/support/tickets/${selectedSupportTicket.id}/reply`, {
        method: "POST",
        accessToken,
        csrfToken,
        body: {
          message,
          senderType: "support"
        }
      });
      setStatus("Reply sent.");
      await loadSupportTicketDetails(selectedSupportTicket.id);
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed to send support reply");
    } finally {
      setSendingSupportReply(false);
    }
  };

  const updateSupportTicketStatus = async (status: "open" | "in_progress" | "resolved" | "closed") => {
    if (!accessToken || !csrfToken || !selectedSupportTicket?.id) return;
    setUpdatingSupportStatus(true);
    try {
      await apiRequest(`/admin/support/tickets/${selectedSupportTicket.id}/status`, {
        method: "PATCH",
        accessToken,
        csrfToken,
        body: { status }
      });
      setStatus(`Support ticket marked ${status.replace("_", " ")}.`);
      await loadSupportTicketDetails(selectedSupportTicket.id);
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed to update support ticket status");
    } finally {
      setUpdatingSupportStatus(false);
    }
  };

  const moderateHomepageReview = async (
    reviewId: string,
    status: "pending" | "approved" | "rejected" | "hidden"
  ) => {
    if (!accessToken || !csrfToken) return;
    setModeratingHomepageReviewId(reviewId);
    try {
      const response = await apiRequest<{ review: AdminHomepageReview }>(`/admin/homepage-reviews/${reviewId}/status`, {
        method: "PATCH",
        accessToken,
        csrfToken,
        body: { status }
      });
      setHomepageReviews((prev) =>
        prev.map((row) => (row.id === reviewId ? { ...row, ...response.review } : row))
      );
      setStatus(`Homepage review marked ${status}.`);
      await load();
    } catch (e) {
      setStatus((e as Error).message || "Failed to update homepage review status");
    } finally {
      setModeratingHomepageReviewId(null);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    const timer = setInterval(async () => {
      try {
        const snapshot = await apiRequest<LiveSnapshot>("/admin/live/snapshot", { accessToken });
        setLive(snapshot);
      } catch {
        // Ignore intermittent polling failures.
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [accessToken]);

  const renderContent = () => {
    if (!overview || !health) {
      return <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">Dashboard data unavailable.</div>;
    }

    const toNum = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const statusBadgeClass: Record<string, string> = {
      open: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
      in_progress: "bg-amber-500/20 text-amber-200 border-amber-400/30",
      resolved: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
      closed: "bg-slate-700 text-slate-200 border-slate-600"
    };
    const latestSupportNotifications = [...supportTickets]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);
    const openSupportInboxForReply = (ticketId: string) => {
      setActiveTab("support");
      void loadSupportTicketDetails(ticketId);
    };
    const renderSupportInboxSection = () => (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Support Inbox (Business Owners)</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{supportTickets.length} tickets</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 [color-scheme:dark]"
              value={supportStatusFilter}
              onChange={(e) => setSupportStatusFilter(e.target.value as "all" | "open" | "in_progress" | "resolved" | "closed")}
            >
              <option className="bg-slate-900 text-slate-100" value="all">All</option>
              <option className="bg-slate-900 text-slate-100" value="open">Open</option>
              <option className="bg-slate-900 text-slate-100" value="in_progress">In Progress</option>
              <option className="bg-slate-900 text-slate-100" value="resolved">Resolved</option>
              <option className="bg-slate-900 text-slate-100" value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.35fr]">
          <div className="max-h-[460px] overflow-auto rounded-lg border border-slate-800">
            {supportTickets.length === 0 ? (
              <p className="p-3 text-sm text-slate-400">No support tickets found.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {supportTickets.map((ticket) => (
                  <button
                    type="button"
                    key={ticket.id}
                    onClick={() => loadSupportTicketDetails(ticket.id)}
                    className={`w-full text-left px-3 py-3 transition hover:bg-slate-800/70 ${
                      selectedSupportTicket?.id === ticket.id ? "bg-slate-800/90" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-100 line-clamp-1">{ticket.subject}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusBadgeClass[ticket.status] || statusBadgeClass.open}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                      {(ticket.org?.name || "Unknown org")} | {(ticket.user?.email || "Unknown user")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {ticket.lastMessage?.message || ticket.description}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {ticket.priority} | {ticket.messageCount} messages | {new Date(ticket.updatedAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            {supportLoading ? (
              <p className="text-sm text-slate-400">Loading support ticket...</p>
            ) : !selectedSupportTicket ? (
              <p className="text-sm text-slate-400">Select a ticket to view business owner messages.</p>
            ) : (
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-semibold text-slate-100">{selectedSupportTicket.subject}</h4>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusBadgeClass[selectedSupportTicket.status] || statusBadgeClass.open}`}>
                      {selectedSupportTicket.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {(selectedSupportTicket.org?.name || "Unknown org")} | {(selectedSupportTicket.user?.email || "Unknown user")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSupportTicket.category} | {selectedSupportTicket.priority} | Updated {new Date(selectedSupportTicket.updatedAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{selectedSupportTicket.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["open", "in_progress", "resolved", "closed"] as const).map((statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        disabled={updatingSupportStatus || selectedSupportTicket.status === statusKey}
                        onClick={() => updateSupportTicketStatus(statusKey)}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Mark {statusKey.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[320px] overflow-auto space-y-2 pr-1">
                  {(selectedSupportTicket.messages || []).length === 0 ? (
                    <p className="text-sm text-slate-400">No messages yet.</p>
                  ) : (
                    selectedSupportTicket.messages.map((message) => (
                      <div key={message.id} className="rounded-lg border border-slate-800 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {String(message.senderType || "unknown")} | {new Date(message.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-slate-200 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <label className="text-xs uppercase tracking-[0.14em] text-slate-500">Reply to business owner</label>
                  <textarea
                    className="mt-2 min-h-[96px] w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    value={supportReply}
                    onChange={(e) => setSupportReply(e.target.value)}
                    placeholder="Type your support reply..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={sendSupportReply}
                      disabled={sendingSupportReply || !supportReply.trim()}
                      className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {sendingSupportReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          To reply: select a ticket on the left, then use the reply box on the right panel.
        </p>
      </section>
    );

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <section className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Live Attempts (1h)</p>
              <p className="mt-2 text-xl sm:text-2xl font-semibold">{live?.payments?.attemptsLastHour || 0}</p>
            </article>
            <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-200/80">Live Success (1h)</p>
              <p className="mt-2 text-xl sm:text-2xl font-semibold">{live?.payments?.successRateLastHour || 0}%</p>
            </article>
            <article className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-200/80">Notification Lag</p>
              <p className="mt-2 text-xl sm:text-2xl font-semibold">{live?.ops?.notificationLag || 0}</p>
            </article>
          </section>
          <section className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-100">
            Reporting currency: <span className="font-semibold">USD</span>. Values are normalized from source
            currencies using live FX rates.
          </section>
          <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 uppercase">GMV (Sales Volume)</p>
                <span title="Gross Merchandise Value: sum of all paid shop orders. This is sales volume, not Debby earnings.">
                  <FiInfo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold mt-2">{money(overview.metrics.totalGmv || 0)}</p>
              <p className="text-xs text-slate-500 mt-1">Take rate {overview.metrics.takeRate || 0}%</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 uppercase">Platform Fee Revenue</p>
                <span title="Sum of platform transaction fees collected from successful/completed shop transactions.">
                  <FiInfo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold mt-2">{money(overview.metrics.platformFeeRevenue || 0)}</p>
              <p className="text-xs text-slate-500 mt-1">Take-rate numerator</p>
            </article>
            {overview.metrics.splitRevenue && (
              <article className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-emerald-400 uppercase">Split Revenue (Debby's Cut)</p>
                  <span title="Revenue Debby earns from payment splits. This is the platform fee portion extracted from each transaction via Paystack subaccount splits and Stripe connect transfers.">
                    <FiInfo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-semibold mt-2 text-emerald-300">
                  {money(overview.metrics.splitRevenue.platformFeeEarned || 0)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  From {money(overview.metrics.splitRevenue.grossVolumeProcessed || 0)} processed
                  {overview.metrics.splitRevenue.effectiveTakeRate > 0
                    ? ` · ${overview.metrics.splitRevenue.effectiveTakeRate}% effective rate`
                    : ""}
                </p>
              </article>
            )}
            {overview.metrics.heldByPlatform && overview.metrics.heldByPlatform.paymentCount > 0 && (
              <article className="rounded-xl border border-amber-700 bg-amber-950/30 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-amber-400 uppercase">Held by Platform</p>
                  <span title="Funds sitting in Debby's account because the merchant has not configured a payout method (Paystack subaccount or Stripe Connect). These need manual disbursement or will auto-route once the merchant connects their account.">
                    <FiInfo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-semibold mt-2 text-amber-300">
                  {money(overview.metrics.heldByPlatform.totalAmount || 0)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {overview.metrics.heldByPlatform.paymentCount} payment{overview.metrics.heldByPlatform.paymentCount !== 1 ? "s" : ""} awaiting merchant payout setup
                </p>
              </article>
            )}
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 uppercase">Net Revenue</p>
                <span title="Net Revenue = Platform Fee Revenue + Subscription Revenue - Refunds - Chargeback Losses.">
                  <FiInfo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold mt-2">{money(overview.metrics.netRevenue || 0)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Fees {money(overview.metrics.platformFeeRevenue || 0)} + Subs {money(overview.metrics.subscriptionRevenue || 0)} - Losses {money(overview.metrics.refundAndChargebackLosses || 0)}
              </p>
            </article>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4"><p className="text-xs text-slate-400 uppercase">Active Businesses</p><p className="text-xl sm:text-2xl font-semibold mt-2">{overview.metrics.activeBusinesses || 0}</p><p className="text-xs text-slate-500 mt-1">ARR {money(overview.metrics.arr || 0)}</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4"><p className="text-xs text-slate-400 uppercase">Churn</p><p className="text-xl sm:text-2xl font-semibold mt-2">{overview.metrics.churnRate || 0}%</p><p className="text-xs text-slate-500 mt-1">MRR {money(overview.metrics.mrr || 0)} | Success {health.successRate || 0}%</p></article>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Revenue Trend (14 Days)</h2>
            <div className="mt-4 h-44 sm:h-56">
              <Bar data={overviewTrendChartData} options={overviewTrendChartOptions} />
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Top Growth Merchants</h3>
              <div className="mt-3 space-y-2 text-sm">
                {(overview.leaders?.topGrowthMerchants || []).slice(0, 5).map((row: any) => (
                  <div key={row.shopId} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                    <span className="truncate pr-3">{row.shopName}</span>
                    <span className="text-emerald-300">+{row.growthRate}%</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Top Risk Merchants</h3>
              <div className="mt-3 space-y-2 text-sm">
                {(overview.leaders?.topRiskMerchants || []).slice(0, 5).map((row: any) => (
                  <div key={row.shopId} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                    <span className="truncate pr-3">{row.shopName}</span>
                    <span className="text-amber-300">{row.unresolvedFlags} flags</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      );
    }

    if (activeTab === "payments") {
      const configuredProviderOrder = getConfiguredProviderOrder(platformConfigs);
      const availableProviderOptions = configuredProviderOrder.length ? configuredProviderOrder : fallbackProviderOrder;
      const effectiveCommandConfig = normalizeCommandConfig(commandConfig, configuredProviderOrder);
      const defaultProvider = effectiveCommandConfig.providerPriority[0];
      const fallbackProvider = effectiveCommandConfig.providerPriority.find((provider) => provider !== defaultProvider) || null;
      const isFallbackActive = Boolean(effectiveCommandConfig.fallbackEnabled && fallbackProvider);

      return (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Debby Platform Gateway Credentials</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Gateway Provider</span>
                  <select className={darkSelectClass} value={platformForm.provider} onChange={(e) => setPlatformForm((p) => ({ ...p, provider: e.target.value as PaymentProvider }))}>
                    <option className="bg-slate-900 text-slate-100" value="paystack">Paystack</option>
                    <option className="bg-slate-900 text-slate-100" value="stripe">Stripe</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Public Key (Optional)</span>
                  <input className={darkInputClass} placeholder="pk_live_xxx" value={platformForm.publicKey} onChange={(e) => setPlatformForm((p) => ({ ...p, publicKey: e.target.value }))} />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Secret Key</span>
                  <input type="password" className={darkInputClass} placeholder="sk_live_xxx" value={platformForm.secretKey} onChange={(e) => setPlatformForm((p) => ({ ...p, secretKey: e.target.value }))} />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Webhook Secret (Optional)</span>
                  <input type="password" className={darkInputClass} placeholder="whsec_xxx / paystack webhook secret" value={platformForm.webhookSecret} onChange={(e) => setPlatformForm((p) => ({ ...p, webhookSecret: e.target.value }))} />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={savePlatformCredentials} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save Credentials</button>
                <button type="button" onClick={() => testProvider(platformForm.provider)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Test</button>
              </div>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Configured Providers</h2>
              <div className="mt-3 space-y-3">
                {platformConfigs.length === 0 ? (
                  <p className="text-sm text-slate-400">No provider credentials saved yet.</p>
                ) : (
                  platformConfigs.map((cfg) => (
                    <div key={cfg.id} className="rounded-lg border border-slate-800 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium capitalize">{cfg.provider}</p>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {cfg.provider === defaultProvider && (
                            <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                              Default
                            </span>
                          )}
                          {cfg.provider === fallbackProvider && isFallbackActive && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                              Fallback
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${cfg.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>
                            {cfg.isActive ? "Active" : cfg.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{cfg.secretKeyMasked}</p>
                      <p className="text-xs text-slate-500 mt-1">Webhook: {cfg.webhookSecretMasked || "Not set"}</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => testProvider(cfg.provider)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">Test</button>
                        <button type="button" onClick={() => activateProvider(cfg.provider)} disabled={cfg.isActive} className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-60">{cfg.isActive ? "Active" : "Activate"}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Gateway Version History</h2>
            <div className="mt-3 grid gap-2">
              {platformVersions.length === 0 ? (
                <p className="text-sm text-slate-400">No gateway versions available.</p>
              ) : (
                platformVersions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-slate-800 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm capitalize">{version.provider} | {version.status}</p>
                        <p className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()} | {version.reason || "No reason"}</p>
                      </div>
                      <button type="button" onClick={() => rollbackVersion(version.id)} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/20">
                        Rollback
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Payments Command Center</h2>
            <p className="mt-2 text-sm text-slate-400">
              Default is used first. Fallback is used only when default fails.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Default Provider</span>
                <select
                  className={darkSelectClass}
                  value={defaultProvider}
                  onChange={(e) => {
                    const nextDefault = e.target.value as PaymentProvider;
                    setCommandConfig((prev) => {
                      const current = normalizeCommandConfig(prev, configuredProviderOrder);
                      const nextFallback = availableProviderOptions.find((provider) => provider !== nextDefault) || null;
                      return {
                        ...current,
                        providerPriority: nextFallback ? [nextDefault, nextFallback] : [nextDefault],
                        fallbackEnabled: nextFallback ? current.fallbackEnabled : false
                      };
                    });
                  }}
                >
                  {availableProviderOptions.map((provider) => (
                    <option className="bg-slate-900 text-slate-100" key={provider} value={provider}>
                      {toProviderLabel(provider)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Fallback Provider</p>
                <p className="mt-1 text-sm text-slate-100">
                  {fallbackProvider ? toProviderLabel(fallbackProvider) : "None"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {fallbackProvider ? "Auto-set to the other configured provider." : "Connect a second provider to enable fallback."}
                </p>
              </div>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Global Fee % Override</span>
                <input
                  type="number"
                  step="0.1"
                  className={darkInputClass}
                  value={effectiveCommandConfig.platformFeePercent}
                  onChange={(e) => setCommandConfig((p) => ({ ...p, platformFeePercent: Number(e.target.value) }))}
                />
                <span className="text-[11px] text-slate-500">
                  Optional legacy command-center percentage (use Fee Policy Matrix for tier-specific charging).
                </span>
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Global Fixed Fee (minor unit)</span>
                <input
                  type="number"
                  className={darkInputClass}
                  value={effectiveCommandConfig.fixedFeeMinor}
                  onChange={(e) => setCommandConfig((p) => ({ ...p, fixedFeeMinor: Number(e.target.value) }))}
                />
                <span className="text-[11px] text-slate-500">
                  Minor unit means kobo/cents. Example: 100 = ₦1 or $1 depending on currency.
                </span>
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="text-sm text-slate-300 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(effectiveCommandConfig.fallbackEnabled && fallbackProvider)}
                  disabled={!fallbackProvider}
                  onChange={(e) => setCommandConfig((p) => ({ ...p, fallbackEnabled: e.target.checked && Boolean(fallbackProvider) }))}
                />
                Enable fallback
              </label>
              <button type="button" onClick={saveCommandConfig} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Save</button>
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Fee Policy Matrix</h2>
              <span className="text-xs text-slate-500">Tier/provider/currency</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Plan</span>
                <select
                  className={darkSelectClass}
                  value={feePolicyForm.planId}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, planId: e.target.value }))}
                >
                  {["free", "starter", "professional", "enterprise", "pro"].map((plan) => (
                    <option key={plan} className="bg-slate-900 text-slate-100" value={plan}>
                      {toPlanLabel(plan)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Provider</span>
                <select
                  className={darkSelectClass}
                  value={feePolicyForm.provider}
                  onChange={(e) =>
                    setFeePolicyForm((p) => ({ ...p, provider: e.target.value as "stripe" | "paystack" }))
                  }
                >
                  <option className="bg-slate-900 text-slate-100" value="paystack">
                    Paystack
                  </option>
                  <option className="bg-slate-900 text-slate-100" value="stripe">
                    Stripe
                  </option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Currency</span>
                <input
                  className={darkInputClass}
                  value={feePolicyForm.currency}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                  placeholder="NGN or USD"
                />
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={feePolicyForm.isLocal}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, isLocal: e.target.checked }))}
                />
                Local checkout rule
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Percent (BPS)</span>
                <input
                  type="number"
                  className={darkInputClass}
                  value={feePolicyForm.percentBps}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, percentBps: Number(e.target.value) }))}
                  placeholder="e.g. 50"
                />
                <span className="text-[11px] text-slate-500">100 bps = 1%. 50 bps = 0.50%.</span>
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Cap Amount</span>
                <input
                  type="number"
                  className={darkInputClass}
                  value={feePolicyForm.capAmount}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, capAmount: Number(e.target.value) }))}
                  placeholder="e.g. 2000"
                />
                <span className="text-[11px] text-slate-500">Maximum platform fee per transaction (same currency).</span>
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Priority</span>
                <input
                  type="number"
                  className={darkInputClass}
                  value={feePolicyForm.priority}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, priority: Number(e.target.value) }))}
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-500">Higher number wins when multiple rules match.</span>
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={feePolicyForm.isActive}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Rule is active
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Notes</span>
                <input
                  className={darkInputClass}
                  value={feePolicyForm.notes}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Internal note for this rule"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Change Reason</span>
                <input
                  className={darkInputClass}
                  value={feePolicyForm.reason}
                  onChange={(e) => setFeePolicyForm((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Reason saved in policy version history"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveFeePolicy}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Save Policy
              </button>
            </div>
            <div className="mt-4 max-h-[300px] overflow-auto rounded-lg border border-slate-800">
              {feePoliciesForDisplay.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No fee policies found.</p>
              ) : (
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Plan</th>
                      <th className="px-3 py-2 text-left font-medium">Provider</th>
                      <th className="px-3 py-2 text-left font-medium">Currency</th>
                      <th className="px-3 py-2 text-left font-medium">Local</th>
                      <th className="px-3 py-2 text-left font-medium">BPS</th>
                      <th className="px-3 py-2 text-left font-medium">Cap</th>
                      <th className="px-3 py-2 text-left font-medium">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePoliciesForDisplay.map((policy) => (
                      <tr key={policy.id} className="border-t border-slate-800/80">
                        <td className="px-3 py-2">{toPlanLabel(toCanonicalPlanId(policy.planId))}</td>
                        <td className="px-3 py-2 capitalize">{policy.provider}</td>
                        <td className="px-3 py-2">{policy.currency}</td>
                        <td className="px-3 py-2">{policy.isLocal ? "Yes" : "No"}</td>
                        <td className="px-3 py-2">{policy.percentBps}</td>
                        <td className="px-3 py-2">{policy.capAmount ?? "-"}</td>
                        <td className="px-3 py-2">{policy.isActive ? "Active" : "Inactive"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Note: base fee-policy rows are system-seeded on first run. Legacy <span className="font-semibold">pro</span> and <span className="font-semibold">enterprise</span> are both shown as Scale.
            </p>
            <div className="mt-4 max-h-[220px] overflow-auto rounded-lg border border-slate-800">
              {feePolicyVersions.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No fee policy versions yet.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {feePolicyVersions.slice(0, 20).map((version) => (
                    <div key={version.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                      <div>
                        <p className="text-xs text-slate-300">
                          {toPlanLabel(toCanonicalPlanId(version.planId))} / {version.provider} / {version.currency} / {version.percentBps}bps
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {version.reason || "policy_update"} | {version.changedByAdminId ? `admin:${version.changedByAdminId}` : "system"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => rollbackFeePolicyVersion(version.id)}
                        disabled={!version.changedByAdminId && version.reason === "seed_default_policy"}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {!version.changedByAdminId && version.reason === "seed_default_policy" ? "Seeded" : "Rollback"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Split Health</h2>
              <span className="text-xs text-slate-500">Paid tiers only</span>
            </div>
            {splitHealth ? (
              <>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Paid Tier Merchants</p>
                    <p className="mt-1 text-lg font-semibold text-slate-100">{splitHealth.summary.paidTierMerchants}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200">Split Ready</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-100">{splitHealth.summary.splitReadyMerchants}</p>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-amber-200">Split Missing</p>
                    <p className="mt-1 text-lg font-semibold text-amber-100">{splitHealth.summary.splitMissingMerchants}</p>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-rose-200">Blocked Checkouts ({splitHealth.windowDays}d)</p>
                    <p className="mt-1 text-lg font-semibold text-rose-100">{splitHealth.summary.blockedCheckouts}</p>
                  </div>
                </div>
                <div className="mt-4 max-h-[320px] overflow-auto rounded-lg border border-slate-800">
                  {splitHealth.merchants.length === 0 ? (
                    <p className="p-3 text-sm text-slate-400">No paid-tier merchants found.</p>
                  ) : (
                    <table className="min-w-full text-xs text-slate-200">
                      <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Business</th>
                          <th className="px-3 py-2 text-left font-medium">Plan</th>
                          <th className="px-3 py-2 text-left font-medium">Stripe</th>
                          <th className="px-3 py-2 text-left font-medium">Paystack</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {splitHealth.merchants.map((merchant) => (
                          <tr key={merchant.orgId} className="border-t border-slate-800/80">
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-100">{merchant.businessName}</p>
                              <p className="text-[11px] text-slate-500">{merchant.ownerEmail || "No owner email"}</p>
                            </td>
                            <td className="px-3 py-2">{toPlanLabel(merchant.planId)}</td>
                            <td className="px-3 py-2">
                              {merchant.providers.stripe.splitCapable ? (
                                <span className="text-emerald-300">Ready</span>
                              ) : merchant.providers.stripe.hasToken ? (
                                <span className="text-amber-300">Needs split config</span>
                              ) : (
                                <span className="text-slate-500">Not connected</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {merchant.providers.paystack.splitCapable ? (
                                <span className="text-emerald-300">Ready</span>
                              ) : merchant.providers.paystack.hasToken ? (
                                <span className="text-amber-300">Needs split config</span>
                              ) : (
                                <span className="text-slate-500">Not connected</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {merchant.splitReady ? (
                                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-200">
                                  Split ready
                                </span>
                              ) : (
                                <span className="rounded-full bg-rose-500/20 px-2 py-1 text-[11px] text-rose-200">
                                  Blocked
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Split health data unavailable.</p>
            )}
          </section>
        </div>
      );
    }

    if (activeTab === "revenue") {
      const movement = modules?.revenueBilling?.mrrMovement || {};
      const mrrCurrent = toNum(overview.metrics?.mrr);
      const arrCurrent = toNum(overview.metrics?.arr);
      const mrrDelta =
        toNum(movement.new) +
        toNum(movement.expansion) +
        toNum(movement.reactivation) -
        toNum(movement.contraction) -
        toNum(movement.churn);
      const mrrPrevious = Math.max(mrrCurrent - mrrDelta, 0);
      const arrPrevious = Math.max(mrrPrevious * 12, 0);
      const mrrSeries: MetricPoint[] = (() => {
        const points: MetricPoint[] = [];
        let running = mrrPrevious;
        points.push({ label: "Prev", value: running });
        running += toNum(movement.new);
        points.push({ label: "New", value: running });
        running += toNum(movement.expansion);
        points.push({ label: "Expansion", value: running });
        running -= toNum(movement.contraction);
        points.push({ label: "Contraction", value: Math.max(running, 0) });
        running -= toNum(movement.churn);
        points.push({ label: "Churn", value: Math.max(running, 0) });
        running += toNum(movement.reactivation);
        points.push({ label: "Reactivation", value: Math.max(running, 0) });
        points.push({ label: "Current", value: mrrCurrent });
        return points;
      })();
      const arrSeries: MetricPoint[] = mrrSeries.map((point, index) => ({
        label: point.label,
        value: index === mrrSeries.length - 1 ? arrCurrent : point.value * 12
      }));

      return (
        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">MRR Chart</h3>
                  <span className="text-xs text-slate-500">Prev vs Current</span>
                </div>
                <select className={chartSelectClass} value={mrrChartType} onChange={(e) => setMrrChartType(e.target.value as RevenueChartType)}>
                  <option className="bg-slate-900 text-slate-100" value="bar">Bar chart</option>
                  <option className="bg-slate-900 text-slate-100" value="line">Line chart</option>
                </select>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-100">{money(mrrCurrent)}</p>
              <MetricSwitchChart
                data={mrrSeries}
                chartType={mrrChartType}
                color={{ line: "#22d3ee", fill: "rgba(34, 211, 238, 0.14)", bar: "#2dd4bf" }}
                valueFormatter={(value) => compact(value)}
              />
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">ARR Chart</h3>
                  <span className="text-xs text-slate-500">Prev vs Current</span>
                </div>
                <select className={chartSelectClass} value={arrChartType} onChange={(e) => setArrChartType(e.target.value as RevenueChartType)}>
                  <option className="bg-slate-900 text-slate-100" value="bar">Bar chart</option>
                  <option className="bg-slate-900 text-slate-100" value="line">Line chart</option>
                </select>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-100">{money(arrCurrent)}</p>
              <MetricSwitchChart
                data={arrSeries}
                chartType={arrChartType}
                color={{ line: "#a78bfa", fill: "rgba(167, 139, 250, 0.14)", bar: "#c084fc" }}
                valueFormatter={(value) => compact(value)}
              />
            </article>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">MRR Movement</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>New: {money(modules?.revenueBilling?.mrrMovement?.new || 0)}</div>
              <div>Expansion: {money(modules?.revenueBilling?.mrrMovement?.expansion || 0)}</div>
              <div>Contraction: {money(modules?.revenueBilling?.mrrMovement?.contraction || 0)}</div>
              <div>Churn: {money(modules?.revenueBilling?.mrrMovement?.churn || 0)}</div>
              <div>Reactivation: {money(modules?.revenueBilling?.mrrMovement?.reactivation || 0)}</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Plan Mix</h3>
            <div className="mt-3 space-y-2 text-sm">{(modules?.revenueBilling?.planMix || []).map((x: any) => <div key={x.planId} className="flex justify-between"><span>{toPlanLabel(x.planId)}</span><span>{x.count} ({x.percent}%)</span></div>)}</div>
          </div>
          </section>
        </div>
      );
    }

    if (activeTab === "risk") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Unresolved Flags</p><p className="text-2xl font-semibold mt-2">{modules?.riskFraud?.unresolvedFlags || 0}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Resolved This Week</p><p className="text-2xl font-semibold mt-2">{modules?.riskFraud?.resolvedThisWeek || 0}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Dispute Outcome</p><p className="text-2xl font-semibold mt-2">{modules?.riskFraud?.disputeOutcomeRate || 0}%</p></div>
        </div>
      );
    }

    if (activeTab === "ops") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-2">
              <p>Waitlist: {modules?.merchantOps?.lifecycleFunnel?.waitlist || 0}</p>
              <p>Activated: {modules?.merchantOps?.lifecycleFunnel?.activated || 0}</p>
              <p>Transacting: {modules?.merchantOps?.lifecycleFunnel?.transacting || 0}</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-2">
              <p>Support open/in progress: {modules?.merchantOps?.supportSla?.openOrInProgress || 0}</p>
              <p>Support backlog &gt;24h: {modules?.merchantOps?.supportSla?.backlogOver24h || 0}</p>
              <p>KYC pending: {modules?.merchantOps?.kycPending || 0}</p>
            </article>
          </div>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Business Owners (30d)</h3>
            <div className="mt-3 max-h-[320px] overflow-auto rounded-lg border border-slate-800">
              {businessOwners.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No business owner data available.</p>
              ) : (
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Business</th>
                      <th className="px-3 py-2 text-left font-medium">Tier</th>
                      <th className="px-3 py-2 text-left font-medium">GMV</th>
                      <th className="px-3 py-2 text-left font-medium">Income</th>
                      <th className="px-3 py-2 text-left font-medium">MRR</th>
                      <th className="px-3 py-2 text-left font-medium">Debby Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessOwners.map((owner) => (
                      <tr
                        key={owner.ownerId}
                        className="cursor-pointer border-t border-slate-800/80 hover:bg-slate-800/60"
                        onClick={() => loadBusinessOwnerDetails(owner.orgId)}
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-100">{owner.businessName}</p>
                          <p className="text-[11px] text-slate-500">{owner.ownerEmail}</p>
                        </td>
                        <td className="px-3 py-2">{toPlanLabel(owner.tier)}</td>
                        <td className="px-3 py-2">{moneyInCurrency(owner.gmv, owner.billingCurrency)}</td>
                        <td className="px-3 py-2">{moneyInCurrency(owner.merchantIncome, owner.billingCurrency)}</td>
                        <td className="px-3 py-2">{moneyInCurrency(owner.mrr, owner.billingCurrency)}</td>
                        <td className="px-3 py-2">{moneyInCurrency(owner.debbyFeeRevenue, owner.billingCurrency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          {selectedOwnerDetails && (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  Owner Drilldown - {selectedOwnerDetails.owner.businessName}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedOwnerDetails(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                  <p className="text-xs text-slate-500">MRR (Plan Price)</p>
                  <p className="text-slate-100">
                    {moneyInCurrency(
                      selectedOwnerDetails.subscription.mrr,
                      selectedOwnerDetails.subscription.billingCurrency
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                  <p className="text-xs text-slate-500">ARR</p>
                  <p className="text-slate-100">
                    {moneyInCurrency(
                      selectedOwnerDetails.subscription.arr,
                      selectedOwnerDetails.subscription.billingCurrency
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Platform Fee Revenue</p>
                  <p className="text-slate-100">
                    {moneyInCurrency(
                      selectedOwnerDetails.transactionSummary?.platformFeeRevenue ??
                        selectedOwnerDetails.ledgerSummary.platformFeeRevenue,
                      selectedOwnerDetails.transactionSummary?.currency ||
                        selectedOwnerDetails.ledgerSummary.currency ||
                        selectedOwnerDetails.subscription.billingCurrency
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Merchant Net (Transactions)</p>
                  <p className="text-slate-100">
                    {moneyInCurrency(
                      selectedOwnerDetails.transactionSummary?.merchantNetIncome ??
                        selectedOwnerDetails.ledgerSummary.merchantNetIncome,
                      selectedOwnerDetails.transactionSummary?.currency ||
                        selectedOwnerDetails.ledgerSummary.currency ||
                        selectedOwnerDetails.subscription.billingCurrency
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-xs text-slate-400">
                Drilldown totals are normalized to USD using live FX rates. Source-currency rows below indicate where
                each converted value came from.
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-800">
                  <p className="border-b border-slate-800 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Split Connections
                  </p>
                  <div className="divide-y divide-slate-800 text-sm">
                    {selectedOwnerDetails.splitConnections.map((row) => (
                      <div key={row.provider} className="px-3 py-2">
                        <p className="capitalize text-slate-100">{row.provider}</p>
                        <p className="text-xs text-slate-400">
                          {row.splitCapable ? "Split-capable" : "Not split-capable"} | {row.connectionStatus}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800">
                  <p className="border-b border-slate-800 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Transaction Summary
                  </p>
                  <div className="divide-y divide-slate-800 text-sm">
                    <div className="px-3 py-2">
                      <p className="text-xs text-slate-500">Successful payments</p>
                      <p className="text-slate-100">{selectedOwnerDetails.transactionSummary?.successfulPayments || 0}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs text-slate-500">Gross processed</p>
                      <p className="text-slate-100">
                        {moneyInCurrency(
                          selectedOwnerDetails.transactionSummary?.grossProcessed || 0,
                          selectedOwnerDetails.transactionSummary?.currency ||
                            selectedOwnerDetails.subscription.billingCurrency
                        )}
                      </p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs text-slate-500">Paid orders</p>
                      <p className="text-slate-100">
                        {selectedOwnerDetails.transactionSummary?.paidOrdersCount || 0} /{" "}
                        {moneyInCurrency(
                          selectedOwnerDetails.transactionSummary?.paidOrdersTotal || 0,
                          selectedOwnerDetails.transactionSummary?.currency ||
                          selectedOwnerDetails.subscription.billingCurrency
                        )}
                      </p>
                    </div>
                    {(selectedOwnerDetails.transactionSummary?.byCurrency || []).length > 0 && (
                      <div className="px-3 py-2">
                        <p className="text-xs text-slate-500">By source currency (converted to USD)</p>
                        <div className="mt-1 space-y-1 text-xs text-slate-300">
                          {(selectedOwnerDetails.transactionSummary?.byCurrency || []).map((row) => (
                            <p key={`${row.sourceCurrency || row.currency}`}>
                              {row.sourceCurrency || row.currency} → USD: Fee {moneyInCurrency(row.platformFeeRevenue, "USD")} | Net{" "}
                              {moneyInCurrency(row.merchantNetIncome, "USD")}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-800">
                  <p className="border-b border-slate-800 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Refunds/Chargebacks
                  </p>
                  <div className="max-h-[180px] overflow-auto divide-y divide-slate-800 text-sm">
                    {selectedOwnerDetails.disputesAndRefunds.length === 0 ? (
                      <p className="px-3 py-3 text-slate-400">No disputes/refunds in selected window.</p>
                    ) : (
                      selectedOwnerDetails.disputesAndRefunds.map((row) => (
                        <div key={row.paymentId} className="px-3 py-2">
                          <p className="text-slate-100">
                            {row.status} | {moneyInCurrency(row.amount, "USD")}
                            {row.sourceCurrency ? ` (from ${row.sourceCurrency})` : ""}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800">
                  <p className="border-b border-slate-800 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                    Ledger By Currency
                  </p>
                  <div className="max-h-[180px] overflow-auto divide-y divide-slate-800 text-sm">
                    {(selectedOwnerDetails.ledgerSummary.byCurrency || []).length === 0 ? (
                      <p className="px-3 py-3 text-slate-400">No ledger rows in selected window.</p>
                    ) : (
                      (selectedOwnerDetails.ledgerSummary.byCurrency || []).map((row) => (
                        <div key={`${row.sourceCurrency || row.currency}`} className="px-3 py-2">
                          <p className="text-slate-100">
                            {row.sourceCurrency || row.currency} → USD: Fee {moneyInCurrency(row.platformFeeRevenue, "USD")}
                          </p>
                          <p className="text-xs text-slate-500">
                            Gross {moneyInCurrency(row.gross, "USD")} | Net {moneyInCurrency(row.merchantNetIncome, "USD")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Latest Support Notifications</h3>
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
              >
                Open Support Inbox
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {latestSupportNotifications.length === 0 ? (
                <p className="text-sm text-slate-400">No support notifications yet.</p>
              ) : (
                latestSupportNotifications.map((ticket) => (
                  <div key={ticket.id} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">{ticket.subject}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {(ticket.org?.name || "Unknown org")} | {(ticket.user?.email || "Unknown user")}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {ticket.lastMessage?.message || ticket.description}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusBadgeClass[ticket.status] || statusBadgeClass.open}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">{new Date(ticket.updatedAt).toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={() => openSupportInboxForReply(ticket.id)}
                        className="rounded-lg bg-cyan-400 px-2.5 py-1 text-[11px] font-semibold text-slate-950"
                      >
                        Reply in Inbox
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Merchant Ops shows only the latest two notifications. Reply workflow is in Support Inbox.
            </p>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Waitlist People</h3>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                {waitlistEntries.length} shown
              </span>
            </div>
            <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-800">
              {waitlistEntries.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No waitlist entries found.</p>
              ) : (
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Joined</th>
                      <th className="px-3 py-2 text-left font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-slate-800/80">
                        <td className="px-3 py-2 text-slate-200">{entry.email}</td>
                        <td className="px-3 py-2 text-slate-400">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Book Demo Requests</h3>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                {bookDemoRequests.length} shown
              </span>
            </div>
            <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-800">
              {bookDemoRequests.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No book demo requests found.</p>
              ) : (
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="sticky top-0 bg-slate-900/90 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Company</th>
                      <th className="px-3 py-2 text-left font-medium">Country</th>
                      <th className="px-3 py-2 text-left font-medium">Monthly Volume</th>
                      <th className="px-3 py-2 text-left font-medium">Submitted</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookDemoRequests.map((entry) => (
                      <tr key={entry.id} className="border-t border-slate-800/80">
                        <td className="px-3 py-2 text-slate-100">{entry.fullName}</td>
                        <td className="px-3 py-2 text-slate-200">{entry.email}</td>
                        <td className="px-3 py-2 text-slate-300">{entry.companyName || "-"}</td>
                        <td className="px-3 py-2 text-slate-300">{entry.country || "-"}</td>
                        <td className="px-3 py-2 text-slate-300">{entry.monthlyVolume || "-"}</td>
                        <td className="px-3 py-2 text-slate-400">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200">
                            {entry.status || "new"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "reliability") {
      return (
        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">p95</p><p className="mt-2 text-2xl font-semibold">{modules?.reliability?.apiLatency?.p95 || 0} ms</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">p99</p><p className="mt-2 text-2xl font-semibold">{modules?.reliability?.apiLatency?.p99 || 0} ms</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Error Rate</p><p className="mt-2 text-2xl font-semibold">{modules?.reliability?.errorRate || 0}%</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Queue Lag</p><p className="mt-2 text-2xl font-semibold">{modules?.reliability?.queue?.notificationLag || 0}</p></article>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Alerts</h3>
            <div className="mt-3 space-y-2">
              {(modules?.reliability?.alerts || []).length === 0 ? (
                <p className="text-sm text-emerald-300">No active reliability alerts.</p>
              ) : (
                (modules?.reliability?.alerts || []).map((a: string) => <p key={a} className="text-sm text-amber-300">{a}</p>)
              )}
            </div>
          </section>
        </div>
      );
    }
    if (activeTab === "support") {
      return (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Support Email Configuration</h3>
            <p className="mt-2 text-sm text-slate-300">
              This email is shown to Starter businesses as their support contact.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                className={darkInputClass}
                placeholder="support@debby.co"
                value={supportEmailForm}
                onChange={(e) => setSupportEmailForm(e.target.value)}
              />
              <button
                type="button"
                onClick={saveSupportEmail}
                disabled={savingSupportEmail}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                {savingSupportEmail ? "Saving..." : "Save Email"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Active: {supportEmailConfig.supportEmail || "Not set"}{" "}
              {supportEmailConfig.updatedAt ? `| Updated ${new Date(supportEmailConfig.updatedAt).toLocaleString()}` : ""}
            </p>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Business Homepage Review Approvals</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  Pending: {homepageReviewSummary?.pending || 0}
                </span>
                <select
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 [color-scheme:dark]"
                  value={homepageReviewStatusFilter}
                  onChange={(e) =>
                    setHomepageReviewStatusFilter(
                      e.target.value as "all" | "pending" | "approved" | "rejected" | "hidden"
                    )
                  }
                >
                  <option className="bg-slate-900 text-slate-100" value="all">All</option>
                  <option className="bg-slate-900 text-slate-100" value="pending">Pending</option>
                  <option className="bg-slate-900 text-slate-100" value="approved">Approved</option>
                  <option className="bg-slate-900 text-slate-100" value="rejected">Rejected</option>
                  <option className="bg-slate-900 text-slate-100" value="hidden">Hidden</option>
                </select>
              </div>
            </div>
            <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-800">
              {homepageReviews.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No homepage reviews found.</p>
              ) : (
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Business Owner</th>
                      <th className="px-3 py-2 text-left font-medium">Review</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homepageReviews.map((review) => {
                      const statusClass =
                        review.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                          : review.status === "rejected"
                            ? "bg-rose-500/20 text-rose-200 border-rose-400/30"
                            : review.status === "hidden"
                              ? "bg-slate-700 text-slate-200 border-slate-600"
                              : "bg-amber-500/20 text-amber-200 border-amber-400/30";
                      return (
                        <tr key={review.id} className="border-t border-slate-800/80">
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-100">{review.displayName}</p>
                            <p className="text-[11px] text-slate-400">{review.roleTitle}</p>
                            <p className="text-[11px] text-slate-500">
                              {review.org?.name || "Unknown org"} | {review.submittedByUser?.email || "Unknown user"}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="line-clamp-3">{review.content}</p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {review.rating}/5 | {new Date(review.createdAt).toLocaleString()}
                            </p>
                            {review.moderationNote ? (
                              <p className="mt-1 text-[11px] text-slate-500">Note: {review.moderationNote}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusClass}`}>
                              {review.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                disabled={moderatingHomepageReviewId === review.id || review.status === "approved"}
                                onClick={() => moderateHomepageReview(review.id, "approved")}
                                className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={moderatingHomepageReviewId === review.id || review.status === "rejected"}
                                onClick={() => moderateHomepageReview(review.id, "rejected")}
                                className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200 disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={moderatingHomepageReviewId === review.id || review.status === "hidden"}
                                onClick={() => moderateHomepageReview(review.id, "hidden")}
                                className="rounded-md border border-slate-600 px-2 py-1 text-[11px] text-slate-300 disabled:opacity-50"
                              >
                                Hide
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          {renderSupportInboxSection()}
        </div>
      );
    }

    if (activeTab === "access") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-3">
            <p>Admin users: {modules?.access?.adminUsers || 0}</p>
            {(modules?.access?.roleCounts || []).map((r: any) => <p key={r.role} className="capitalize">{r.role}: {r.count}</p>)}
            <p className="text-xs text-slate-400">Roles: {(modules?.access?.availableAdminRoles || []).join(", ")}</p>
            <div className="grid gap-2">
              <select className={darkSelectClass} value={roleForm.userId} onChange={(e) => setRoleForm((p) => ({ ...p, userId: e.target.value }))}>
                {adminRoles.map((row) => (
                  <option className="bg-slate-900 text-slate-100" key={row.userId} value={row.userId}>
                    {row.email}
                  </option>
                ))}
              </select>
              <select className={darkSelectClass} value={roleForm.role} onChange={(e) => setRoleForm((p) => ({ ...p, role: e.target.value }))}>
                {(modules?.access?.availableAdminRoles || []).map((role: string) => (
                  <option className="bg-slate-900 text-slate-100" key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={assignRole} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300">Assign Role</button>
                <button type="button" onClick={removeRole} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20">Remove Role</button>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Admin Role Matrix</h3>
            <div className="mt-3 space-y-2">
              {adminRoles.map((row) => (
                <article key={row.userId} className="rounded-lg border border-slate-800 px-3 py-2">
                  <p className="text-sm">{row.email}</p>
                  <p className="text-xs text-slate-400">{[row.firstName, row.lastName].filter(Boolean).join(" ") || "No profile name"}</p>
                  <p className="mt-1 text-xs text-slate-300">{row.roles.length ? row.roles.join(", ") : "No roles assigned"}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Platform Users</h3>
              <span className="text-xs text-slate-500">{platformUsers.length} loaded</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Deleting a non-admin user here wipes that user&apos;s entire organization data, including shops and transactions.
            </p>
            <div className="mt-3 max-h-[320px] overflow-auto rounded-lg border border-slate-800">
              {platformUsers.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">No users found.</p>
              ) : (
                <table className="min-w-full text-xs text-slate-200">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Tier</th>
                      <th className="px-3 py-2 text-left font-medium">Org</th>
                      <th className="px-3 py-2 text-left font-medium">Shops</th>
                      <th className="px-3 py-2 text-left font-medium">Created</th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformUsers.map((row) => (
                      <tr key={row.id} className="border-t border-slate-800/80">
                        <td className="px-3 py-2">
                          <p className="text-slate-100">{row.email}</p>
                          <p className="text-[11px] text-slate-500">ID: {row.id}</p>
                        </td>
                        <td className="px-3 py-2 capitalize">
                          {row.role} / {row.teamRole}
                        </td>
                        <td className="px-3 py-2">
                          {row.role === "business" ? (
                            <div className="min-w-[170px] space-y-1">
                              <select
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-100 [color-scheme:dark]"
                                value={toCanonicalPlanId(platformUserPlanDrafts[row.id] || row.planId || "free")}
                                onChange={(e) =>
                                  setPlatformUserPlanDrafts((prev) => ({
                                    ...prev,
                                    [row.id]: toCanonicalPlanId(e.target.value)
                                  }))
                                }
                              >
                                <option className="bg-slate-900 text-slate-100" value="free">Free</option>
                                <option className="bg-slate-900 text-slate-100" value="starter">Starter</option>
                                <option className="bg-slate-900 text-slate-100" value="professional">Growth</option>
                                <option className="bg-slate-900 text-slate-100" value="enterprise">Scale</option>
                              </select>
                              <p className="text-[10px] text-slate-500">
                                {String(row.subscriptionStatus || "none").replace("_", " ")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-slate-200">{row.orgName}</p>
                          <p className="text-[11px] text-slate-500">{row.orgId}</p>
                        </td>
                        <td className="px-3 py-2">{row.shopCount}</td>
                        <td className="px-3 py-2">{new Date(row.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {row.role === "business" ? (
                              <button
                                type="button"
                                disabled={
                                  updatingPlatformUserPlanId === row.id ||
                                  toCanonicalPlanId(platformUserPlanDrafts[row.id] || row.planId || "free") ===
                                    toCanonicalPlanId(row.planId || "free")
                                }
                                onClick={() => savePlatformUserPlan(row)}
                                className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updatingPlatformUserPlanId === row.id ? "Saving..." : "Save Tier"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              disabled={row.role === "admin" || deletingPlatformUserId === row.id}
                              onClick={() => requestDeletePlatformUser(row)}
                              className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingPlatformUserId === row.id ? "Deleting..." : row.role === "admin" ? "Protected" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Business Entitlement Audit Matrix</h3>
              <span className="text-xs text-slate-500">
                {entitlementMatrix?.generatedAt ? `Updated ${new Date(entitlementMatrix.generatedAt).toLocaleString()}` : "Not loaded"}
              </span>
            </div>
            {entitlementMatrix ? (
              <>
                <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-lg border border-slate-800 px-3 py-2">Routes: {entitlementMatrix.summary.totalRoutes}</div>
                  <div className="rounded-lg border border-slate-800 px-3 py-2">Feature routes: {entitlementMatrix.summary.featureRoutes}</div>
                  <div className="rounded-lg border border-slate-800 px-3 py-2">Core routes: {entitlementMatrix.summary.coreRoutes}</div>
                  <div className="rounded-lg border border-slate-800 px-3 py-2">Guarded: {entitlementMatrix.summary.guardedRoutes}</div>
                  <div className="rounded-lg border border-slate-800 px-3 py-2">Unguarded: {entitlementMatrix.summary.unguardedRoutes}</div>
                  <div className="rounded-lg border border-slate-800 px-3 py-2 text-amber-300">
                    Feature outside guard: {entitlementMatrix.summary.featureRoutesOutsideGuardChain}
                  </div>
                </div>
                <div className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-slate-800">
                  <table className="min-w-full text-xs text-slate-200">
                    <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Method</th>
                        <th className="px-3 py-2 text-left font-medium">Path</th>
                        <th className="px-3 py-2 text-left font-medium">Feature</th>
                        <th className="px-3 py-2 text-left font-medium">Guard Chain</th>
                        <th className="px-3 py-2 text-left font-medium">Line</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entitlementMatrix.routes.slice(0, 220).map((row) => (
                        <tr key={`${row.method}-${row.path}-${row.sourceLine}`} className="border-t border-slate-800/80">
                          <td className="px-3 py-2 uppercase">{row.method}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">{row.path}</td>
                          <td className="px-3 py-2 capitalize">{row.feature}</td>
                          <td className="px-3 py-2">
                            {row.protectedByBusinessGuardChain ? (
                              <span className="text-emerald-300">Guarded</span>
                            ) : (
                              <span className="text-slate-500">Outside guard</span>
                            )}
                          </td>
                          <td className="px-3 py-2">{row.sourceLine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Entitlement matrix unavailable.</p>
            )}
          </section>
        </div>
      );
    }

    if (activeTab === "audit") {
      return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">{auditLogs.map((log) => <div key={log.id} className="rounded-lg border border-slate-800 p-3"><p className="text-sm font-medium">{log.eventType}</p><p className="text-xs text-slate-400 mt-1">{log.userEmail || "Unknown"} | {new Date(log.createdAt).toLocaleString()}</p></div>)}</div>;
    }

    return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">Module data loaded. {modules ? "Metrics are available for this section." : "No module metrics loaded yet."}</div>;
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex max-md:[&_.text-4xl]:text-3xl max-md:[&_.text-3xl]:text-2xl max-md:[&_.text-2xl]:text-xl max-md:[&_.text-xl]:text-lg max-md:[&_.text-lg]:text-base max-md:[&_.text-base]:text-sm max-md:[&_.text-sm]:text-xs">
        <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as AdminTab)} onLogout={logout} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)} hideOnSmallScreens mobileMenuOpen={isMobileSidebarOpen} onMobileMenuOpenChange={setIsMobileSidebarOpen} showMobileToggleButton={false} showLogout={false} compactOpenWidthOnMobileMd compactLinkDensity theme="dark" />
        <header className="fixed top-0 left-0 right-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur h-16 flex items-center">
          <div className="w-full px-3 sm:px-5 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsMobileSidebarOpen((p) => !p)} className="sm:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800" aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}><FiMenu className="h-4 w-4" /></button>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Debby Internal</p><h1 className="text-sm sm:text-base lg:text-lg font-semibold">Admin Control Tower</h1></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {fxStatus ? (
                <span
                  className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] sm:text-[11px] text-cyan-100"
                  title={`FX ${fxStatus.reportingCurrency || "USD"} • ${String(fxStatus.source || "fallback").toUpperCase()} • ${
                    fxStatus.fetchedAt ? new Date(fxStatus.fetchedAt).toLocaleString() : "No timestamp"
                  }`}
                >
                  <span className="font-semibold">FX {fxStatus.reportingCurrency || "USD"}</span>
                  <span className="text-cyan-200/80">{String(fxStatus.source || "fallback").toUpperCase()}</span>
                  <span className="hidden md:inline text-cyan-200/70">
                    {fxStatus.fetchedAt ? new Date(fxStatus.fetchedAt).toLocaleTimeString() : "No timestamp"}
                  </span>
                </span>
              ) : null}
              <span className="hidden md:block text-xs text-slate-400">{user?.email || "Admin Session"}</span>
              <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-800"><FiRefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span></button>
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-red-200 hover:bg-red-500/20"><FiLogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span></button>
            </div>
          </div>
        </header>
        <main className="flex-1 transition-all duration-300 relative z-10 overflow-x-hidden" style={{ marginLeft: isMobileViewport ? "0px" : "var(--sidebar-width, 180px)", marginTop: "64px" }}>
          <div className={`max-w-[1760px] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 ${denseTableScopeClass}`}>
            {status && <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">{status}</div>}
            {loading ? <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Loading admin control tower...</div> : renderContent()}
          </div>
        </main>
      </div>
      <ConfirmModal
        isOpen={Boolean(pendingDeleteUser)}
        onClose={() => (deletingPlatformUserId ? null : setPendingDeleteUser(null))}
        onConfirm={confirmDeletePlatformUser}
        title="Delete User and Organization Data"
        message={
          pendingDeleteUser ? (
            <div className="space-y-2 text-sm">
              <p>
                Delete <span className="font-semibold">{pendingDeleteUser.email}</span> and wipe all data for{" "}
                <span className="font-semibold">{pendingDeleteUser.orgName}</span>?
              </p>
              <p className="text-xs text-gray-500">
                This deletes shops, orders, payments, customers, and related records permanently.
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="danger"
        loading={Boolean(deletingPlatformUserId)}
      />
    </>
  );
};
