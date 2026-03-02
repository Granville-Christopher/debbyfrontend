import React, { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiBarChart2, FiCreditCard, FiDollarSign, FiLogOut, FiMenu, FiRefreshCw, FiSettings, FiShield, FiUsers } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAdminAuth } from "../auth/AdminAuthProvider";
import { Sidebar } from "../components/Sidebar";

type AdminTab = "overview" | "payments" | "revenue" | "risk" | "ops" | "reliability" | "audit" | "access";
type Overview = { metrics: any; trends: { revenueByDay: Array<{ date: string; amount: number }> }; leaders: any };
type Health = { attempts: number; successRate: number; declineRate: number; refundAndChargebackRate: number; fraudFlags: number; avgPaymentApiLatencyMs: number };
type PaymentProvider = "paystack" | "stripe";
type CmdConfig = { providerPriority: PaymentProvider[]; fallbackEnabled: boolean; platformFeePercent: number; fixedFeeMinor: number; settlementSchedule: "daily" | "weekly" | "manual" };
type GatewayConfig = { id: string; provider: PaymentProvider; status: string; isActive: boolean; secretKeyMasked: string; webhookSecretMasked: string | null; lastValidationOk: boolean | null; createdAt: string; updatedAt: string };
type GatewayVersion = { id: string; provider: "stripe" | "paystack"; status: string; isActive: boolean; reason: string | null; createdAt: string };
type RoleRow = { userId: string; email: string; firstName?: string | null; lastName?: string | null; roles: string[] };
type LiveSnapshot = { at: string; payments: { attemptsLastHour: number; successRateLastHour: number; failureRateLastHour: number }; ops: { notificationLag: number; unresolvedFraudFlags: number } };
type WaitlistEntry = { id: string; email: string; createdAt: string; updatedAt: string };

const defaultCmdConfig: CmdConfig = { providerPriority: ["paystack", "stripe"], fallbackEnabled: true, platformFeePercent: 2.5, fixedFeeMinor: 0, settlementSchedule: "daily" };
const fallbackProviderOrder: PaymentProvider[] = ["paystack", "stripe"];
const money = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v || 0);
const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);
const toProviderLabel = (provider: PaymentProvider) => provider === "paystack" ? "Paystack" : "Stripe";

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

export const AdminDashboard = () => {
  const { accessToken, csrfToken, user, logout } = useAdminAuth();
  const darkInputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/60";
  const darkSelectClass = `${darkInputClass} appearance-none [color-scheme:dark]`;
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
  const [adminRoles, setAdminRoles] = useState<RoleRow[]>([]);
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [activeProvider, setActiveProvider] = useState<"stripe" | "paystack" | null>(null);
  const [commandConfig, setCommandConfig] = useState<CmdConfig>(defaultCmdConfig);
  const [platformForm, setPlatformForm] = useState({ provider: "paystack" as "stripe" | "paystack", secretKey: "", publicKey: "", webhookSecret: "" });
  const [roleForm, setRoleForm] = useState({ userId: "", role: "support_admin" });

  const tabs = useMemo(() => [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "payments", label: "Payments", icon: <FiCreditCard /> },
    { id: "revenue", label: "Revenue", icon: <FiDollarSign /> },
    { id: "risk", label: "Risk", icon: <FiAlertTriangle /> },
    { id: "ops", label: "Merchant Ops", icon: <FiUsers /> },
    { id: "reliability", label: "Reliability", icon: <FiBarChart2 /> },
    { id: "audit", label: "Audit", icon: <FiSettings /> },
    { id: "access", label: "Access", icon: <FiShield /> }
  ], []);

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
        apiRequest<{ versions: GatewayVersion[] }>("/admin/platform-gateway/versions?limit=8", { accessToken }),
        apiRequest<LiveSnapshot>("/admin/live/snapshot", { accessToken }),
        apiRequest<{ entries: WaitlistEntry[] }>("/admin/waitlist?limit=200", { accessToken })
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
        setPlatformVersions(optional[2].value.versions || []);
      } else {
        setPlatformVersions([]);
      }
      if (optional[3].status === "fulfilled") {
        setLive(optional[3].value);
      }
      if (optional[4].status === "fulfilled") {
        setWaitlistEntries(optional[4].value.entries || []);
      } else {
        setWaitlistEntries([]);
      }
    } catch (e) { setStatus((e as Error).message || "Failed to load admin dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [accessToken]);

  const chart = overview?.trends.revenueByDay || [];
  const max = Math.max(...chart.map((d) => d.amount), 1);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((r) => Math.round(max * r));

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

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Live Attempts (1h)</p>
              <p className="mt-2 text-2xl font-semibold">{live?.payments?.attemptsLastHour || 0}</p>
            </article>
            <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-200/80">Live Success (1h)</p>
              <p className="mt-2 text-2xl font-semibold">{live?.payments?.successRateLastHour || 0}%</p>
            </article>
            <article className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-200/80">Notification Lag</p>
              <p className="mt-2 text-2xl font-semibold">{live?.ops?.notificationLag || 0}</p>
            </article>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">GMV</p><p className="text-2xl font-semibold mt-2">{money(overview.metrics.totalGmv || 0)}</p><p className="text-xs text-slate-500 mt-1">Take rate {overview.metrics.takeRate || 0}%</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Net Revenue</p><p className="text-2xl font-semibold mt-2">{money(overview.metrics.netRevenue || 0)}</p><p className="text-xs text-slate-500 mt-1">MRR {money(overview.metrics.mrr || 0)}</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Active Businesses</p><p className="text-2xl font-semibold mt-2">{overview.metrics.activeBusinesses || 0}</p><p className="text-xs text-slate-500 mt-1">ARR {money(overview.metrics.arr || 0)}</p></article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400 uppercase">Churn</p><p className="text-2xl font-semibold mt-2">{overview.metrics.churnRate || 0}%</p><p className="text-xs text-slate-500 mt-1">Success {health.successRate || 0}%</p></article>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-[0.14em] text-slate-400">Revenue Trend (14 Days)</h2>
            <div className="mt-4 flex min-w-0 gap-3">
              <div className="w-12 flex flex-col justify-between text-[10px] text-slate-500">{ticks.map((t) => <span key={t}>{compact(t)}</span>)}</div>
              <div className="flex-1 min-w-0"><div className="h-44 sm:h-56 border-l border-b border-slate-700 pl-2 pr-1"><div className="h-full flex items-end justify-between gap-1 sm:gap-2">{chart.map((d) => <div key={d.date} className="flex-1 min-w-0 flex flex-col items-center justify-end"><div className="w-full max-w-[10px] sm:max-w-[14px] lg:max-w-[18px] rounded-t bg-emerald-400/85" style={{ height: `${Math.max((d.amount / max) * 100, 2)}%` }} /><span className="mt-2 text-[9px] sm:text-[10px] text-slate-500">{d.date.slice(5)}</span></div>)}</div></div></div>
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
                <select className={darkSelectClass} value={platformForm.provider} onChange={(e) => setPlatformForm((p) => ({ ...p, provider: e.target.value as PaymentProvider }))}><option className="bg-slate-900 text-slate-100" value="paystack">Paystack</option><option className="bg-slate-900 text-slate-100" value="stripe">Stripe</option></select>
                <input className={darkInputClass} placeholder="Public key (optional)" value={platformForm.publicKey} onChange={(e) => setPlatformForm((p) => ({ ...p, publicKey: e.target.value }))} />
                <input type="password" className={`${darkInputClass} sm:col-span-2`} placeholder="Secret key" value={platformForm.secretKey} onChange={(e) => setPlatformForm((p) => ({ ...p, secretKey: e.target.value }))} />
                <input type="password" className={`${darkInputClass} sm:col-span-2`} placeholder="Webhook secret (optional)" value={platformForm.webhookSecret} onChange={(e) => setPlatformForm((p) => ({ ...p, webhookSecret: e.target.value }))} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={savePlatformCredentials} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Save Credentials</button>
                <button onClick={() => testProvider(platformForm.provider)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Test</button>
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
                        <button onClick={() => testProvider(cfg.provider)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800">Test</button>
                        <button onClick={() => activateProvider(cfg.provider)} disabled={cfg.isActive} className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-60">{cfg.isActive ? "Active" : "Activate"}</button>
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
              <input type="number" step="0.1" className={darkInputClass} value={effectiveCommandConfig.platformFeePercent} onChange={(e) => setCommandConfig((p) => ({ ...p, platformFeePercent: Number(e.target.value) }))} />
              <input type="number" className={darkInputClass} value={effectiveCommandConfig.fixedFeeMinor} onChange={(e) => setCommandConfig((p) => ({ ...p, fixedFeeMinor: Number(e.target.value) }))} />
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
              <button onClick={saveCommandConfig} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Save</button>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "revenue") {
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">MRR Movement</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>New: {money(modules?.revenueBilling?.mrrMovement?.new || 0)}</div>
              <div>Expansion: {money(modules?.revenueBilling?.mrrMovement?.expansion || 0)}</div>
              <div>Contraction: {money(modules?.revenueBilling?.mrrMovement?.contraction || 0)}</div>
              <div>Churn: {money(modules?.revenueBilling?.mrrMovement?.churn || 0)}</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm uppercase tracking-[0.14em] text-slate-400">Plan Mix</h3>
            <div className="mt-3 space-y-2 text-sm">{(modules?.revenueBilling?.planMix || []).map((x: any) => <div key={x.planId} className="flex justify-between"><span className="capitalize">{x.planId}</span><span>{x.count} ({x.percent}%)</span></div>)}</div>
          </div>
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
        </div>
      );
    }

    if (activeTab === "audit") {
      return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">{auditLogs.map((log) => <div key={log.id} className="rounded-lg border border-slate-800 p-3"><p className="text-sm font-medium">{log.eventType}</p><p className="text-xs text-slate-400 mt-1">{log.userEmail || "Unknown"} | {new Date(log.createdAt).toLocaleString()}</p></div>)}</div>;
    }

    return <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">Module data loaded. {modules ? "Metrics are available for this section." : "No module metrics loaded yet."}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as AdminTab)} onLogout={logout} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)} hideOnSmallScreens mobileMenuOpen={isMobileSidebarOpen} onMobileMenuOpenChange={setIsMobileSidebarOpen} showMobileToggleButton={false} showLogout={false} compactOpenWidthOnMobileMd compactLinkDensity theme="dark" />
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur h-16 flex items-center">
        <div className="w-full px-3 sm:px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsMobileSidebarOpen((p) => !p)} className="sm:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800" aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}><FiMenu className="h-4 w-4" /></button>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Debby Internal</p><h1 className="text-sm sm:text-base lg:text-lg font-semibold">Admin Control Tower</h1></div>
          </div>
          <div className="flex items-center gap-2"><span className="hidden md:block text-xs text-slate-400">{user?.email || "Admin Session"}</span><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-800"><FiRefreshCw className="h-4 w-4" />Refresh</button><button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs sm:text-sm text-red-200 hover:bg-red-500/20"><FiLogOut className="h-4 w-4" />Logout</button></div>
        </div>
      </header>
      <main className="flex-1 transition-all duration-300 relative z-10 overflow-x-hidden" style={{ marginLeft: isMobileViewport ? "0px" : "var(--sidebar-width, 180px)", marginTop: "64px" }}>
        <div className="max-w-[1760px] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {status && <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">{status}</div>}
          {loading ? <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Loading admin control tower...</div> : renderContent()}
        </div>
      </main>
    </div>
  );
};
