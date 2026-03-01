import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DevNav } from "../components/DevNav";
import { useAuth } from "../auth/AuthProvider";
import { apiRequest } from "../api/client";
import { Collapsible } from "../components/Collapsible";
import { Sidebar } from "../components/Sidebar";
import { Modal, ConfirmModal } from "../components/Modal";
import { GlobalSearch, useGlobalSearch } from "../components/GlobalSearch";
import { Onboarding, useOnboarding } from "../components/Onboarding";
import { HelpCenter, useHelpCenter } from "../components/HelpCenter";
import { useKeyboardShortcuts } from "../components/KeyboardShortcuts";
import { WebhookPlayground } from "../components/WebhookPlayground";
import { BillingPlans } from "../components/BillingPlans";
import { 
  FiBarChart2, 
  FiKey, 
  FiLink, 
  FiFileText, 
  FiLink2, 
  FiClipboard, 
  FiSettings,
  FiAlertTriangle,
  FiPlay,
  FiBook,
  FiDollarSign,
  FiHelpCircle
} from "react-icons/fi";

type ApiKey = {
  id: string;
  name: string;
  lastFour: string;
  createdAt: string;
  lastUsedAt?: string;
};

type Webhook = {
  id: string;
  url: string;
  enabled: boolean;
  maxRetries: number;
  createdAt: string;
};

type EventLog = {
  id: string;
  eventType: string;
  status: string;
  attempts: number;
  lastStatusCode?: number;
  lastError?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

type SecurityLog = {
  id: string;
  eventType: string;
  createdAt: string;
  meta: Record<string, unknown>;
};

type Integration = {
  provider: string;
  connectedAt: string;
};

type DeliveryAttempt = {
  id: string;
  attemptNumber: number;
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  durationMs?: number;
  headersSent?: Record<string, string> | null;
  startedAt: string;
  completedAt?: string;
};

type Metrics = {
  timestamp: string;
  webhooks: { total: number; active: number };
  apiKeys: { total: number; activeLast24h: number };
  events: {
    last24h: number;
    last7d: number;
    byStatus: { queued: number; delivered: number; failed: number; retrying: number };
  };
  deliveries: { byStatusCode: Record<string, number> };
  integrations: { total: number };
};

export const DeveloperDashboard = () => {
  const { accessToken, csrfToken, refresh, user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const [newWebhookHeaders, setNewWebhookHeaders] = useState('{"X-App":"demo"}');
  const [newWebhookRetries, setNewWebhookRetries] = useState(5);
  const [integrationProvider, setIntegrationProvider] = useState("stripe");
  const [integrationToken, setIntegrationToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<DeliveryAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "api-keys" | "webhooks" | "playground" | "events" | "integrations" | "docs" | "billing" | "logs" | "settings" | "analytics" | "request-logs" | "quotas" | "testing">("overview");
  const [showApiKeyDocs, setShowApiKeyDocs] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; data?: any }>>({});
  const [activeEventTab, setActiveEventTab] = useState<'webhooks' | 'github'>('webhooks');
  const [githubEvents, setGithubEvents] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [keys, hooks, eventLogs, systemLogs, integrationList] = await Promise.all([
        apiRequest<{ apiKeys: ApiKey[] }>("/developer/api-keys", { accessToken }),
        apiRequest<{ webhooks: Webhook[] }>("/developer/webhooks", { accessToken }),
        apiRequest<{ events: EventLog[] }>("/developer/events", { accessToken }),
        apiRequest<{ logs: SecurityLog[] }>("/developer/logs", { accessToken }),
        apiRequest<{ integrations: Integration[] }>("/developer/integrations", { accessToken })
      ]);
      
      setApiKeys(keys.apiKeys);
      setWebhooks(hooks.webhooks);
      setEvents(eventLogs.events);
      setLogs(systemLogs.logs);
      setIntegrations(integrationList.integrations);
      
      const metricsData = await apiRequest<{ metrics: Metrics }>("/developer/stats", { accessToken });
      setMetrics(metricsData.metrics);
    } catch (err) {
      setStatus("Failed to load data");
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  useEffect(() => {
    if (activeTab === "events" && activeEventTab === "github" && accessToken) {
      apiRequest<{ events: any[] }>("/developer/github/events", { accessToken })
        .then(data => setGithubEvents(data.events))
        .catch(() => {});
    }
  }, [activeTab, activeEventTab, accessToken]);

  // Auto-clear status message after 2 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Clear status when tab changes
  useEffect(() => {
    setStatus(null);
  }, [activeTab]);
  
  // Load deletion status when on settings tab
  useEffect(() => {
    if (activeTab === "settings" && accessToken) {
      loadDeletionStatus();
    }
  }, [activeTab, accessToken]);

  const createApiKey = async () => {
    try {
      const data = await apiRequest<{ apiKey: { id: string; name: string; key: string } }>(
        "/developer/api-keys",
        { method: "POST", accessToken, body: { name: newKeyName } }
      );
      setStatus(`✅ API Key created: ${data.apiKey.key} (save this - it won't be shown again)`);
      setNewKeyName("");
      await loadData();
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  };

  const createWebhook = async () => {
    if (!accessToken) {
      setStatus("❌ Not authenticated. Please refresh the page or log in again.");
      return;
    }
    if (!newWebhookUrl || !newWebhookSecret) {
      setStatus("❌ URL and Secret are required");
      return;
    }
    if (newWebhookSecret.length < 16) {
      setStatus("❌ Secret must be at least 16 characters");
      return;
    }
    try {
      let headers: Record<string, string> | undefined;
      if (newWebhookHeaders.trim()) {
        try {
          headers = JSON.parse(newWebhookHeaders);
        } catch {
          setStatus("❌ Invalid headers JSON");
          return;
        }
      }
      await apiRequest("/developer/webhooks", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { url: newWebhookUrl, secret: newWebhookSecret, headers, maxRetries: newWebhookRetries }
      });
      setStatus("✅ Webhook created successfully");
      setNewWebhookUrl("");
      setNewWebhookSecret("");
      setNewWebhookHeaders('{"X-App":"demo"}');
      await loadData();
    } catch (err: any) {
      // If we get a 401, the token expired - try refreshing
      if (err?.response?.status === 401) {
        try {
          await refresh();
          setStatus("🔄 Token refreshed. Please try creating the webhook again.");
          return;
        } catch {
          setStatus("❌ Authentication expired. Please refresh the page (F5) and try again.");
          return;
        }
      }
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to create webhook";
      setStatus(`❌ Error: ${errorMsg}`);
    }
  };

  const connectIntegration = async () => {
    try {
      await apiRequest("/developer/integrations", {
        method: "POST",
        accessToken,
        body: { provider: integrationProvider, token: integrationToken }
      });
      setStatus("✅ Integration connected");
      setIntegrationToken("");
      await loadData();
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  };

  const disconnectIntegration = async (provider: string) => {
    try {
      await apiRequest(`/developer/integrations/${provider}`, { method: "DELETE", accessToken });
      setStatus("✅ Integration disconnected");
      await loadData();
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    }
  };

  const testIntegration = async (provider: string) => {
    setTestingIntegration(provider);
    try {
      const result = await apiRequest<{ success: boolean; message: string; data?: any }>(
        `/developer/integrations/${provider}/test`,
        { method: "POST", accessToken }
      );
      setTestResults((prev) => ({ ...prev, [provider]: result }));
      if (result.success) {
        setStatus(`✅ ${result.message}`);
      } else {
        setStatus(`❌ ${result.message}`);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Test failed";
      setTestResults((prev) => ({ ...prev, [provider]: { success: false, message: errorMsg } }));
      setStatus(`❌ Test failed: ${errorMsg}`);
    } finally {
      setTestingIntegration(null);
    }
  };

  const loadEventHistory = async (eventId: string) => {
    try {
      const data = await apiRequest<{ attempts: DeliveryAttempt[] }>(
        `/developer/events/${eventId}/history`,
        { accessToken }
      );
      setEventHistory(data.attempts);
      setSelectedEventId(eventId);
    } catch (err) {
      setStatus(`Error loading history: ${(err as Error).message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      delivered: "badge-success",
      failed: "badge-danger",
      queued: "badge",
      retrying: "badge-warning"
    };
    return badges[status] || "badge";
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  // Update Password
  const handleUpdatePassword = async () => {
    if (!accessToken) {
      setStatus("❌ Not authenticated");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setStatus("❌ New passwords do not match");
      return;
    }
    
    if (newPassword.length < 12) {
      setStatus("❌ New password must be at least 12 characters");
      return;
    }
    
    setPasswordLoading(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { currentPassword, newPassword, confirmPassword }
      });
      setStatus("✅ Password updated successfully. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Log out after password change
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setStatus(`❌ ${err?.response?.data?.error || err?.message || "Failed to update password"}`);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Account Deletion
  const loadDeletionStatus = async () => {
    if (!accessToken) return;
    try {
      const deletionStatus = await apiRequest<{
        hasPendingRequest: boolean;
        scheduledAt?: string;
      }>("/auth/deletion-status", { accessToken });
      setHasPendingDeletion(deletionStatus.hasPendingRequest);
      setDeletionScheduledAt(deletionStatus.scheduledAt || null);
    } catch (err) {
      // Ignore
    }
  };
  
  const handleRequestDeletion = async () => {
    if (!accessToken) {
      setStatus("❌ Not authenticated");
      return;
    }
    
    setDeletionLoading(true);
    try {
      const result = await apiRequest<{ scheduledAt: string }>("/auth/request-deletion", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { reason: deleteReason }
      });
      setStatus("✅ Account deletion request submitted");
      setShowDeleteConfirmModal(false);
      setShowDeleteModal(false);
      setHasPendingDeletion(true);
      setDeletionScheduledAt(result.scheduledAt);
      setDeleteReason("");
    } catch (err: any) {
      setStatus(`❌ ${err?.response?.data?.error || err?.message || "Failed to submit deletion request"}`);
    } finally {
      setDeletionLoading(false);
    }
  };
  
  const handleCancelDeletion = async () => {
    if (!accessToken) return;
    
    try {
      await apiRequest("/auth/request-deletion", {
        method: "DELETE",
        accessToken,
        csrfToken
      });
      setStatus("✅ Account deletion request cancelled");
      setHasPendingDeletion(false);
      setDeletionScheduledAt(null);
    } catch (err: any) {
      setStatus(`❌ ${err?.response?.data?.error || err?.message || "Failed to cancel deletion"}`);
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Settings state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [hasPendingDeletion, setHasPendingDeletion] = useState(false);
  const [deletionScheduledAt, setDeletionScheduledAt] = useState<string | null>(null);
  
  // API Key delete modal
  const [showApiKeyDeleteModal, setShowApiKeyDeleteModal] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null);
  
  // Integration delete modal
  const [showIntegrationDeleteModal, setShowIntegrationDeleteModal] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(null);

  // Global Search
  const { isOpen: isSearchOpen, setIsOpen: setSearchOpen } = useGlobalSearch();
  
  // Help Center
  const { isOpen: isHelpOpen, setIsOpen: setHelpOpen } = useHelpCenter();
  
  // Onboarding
  const { showOnboarding, setShowOnboarding } = useOnboarding("developer");
  
  // Keyboard Shortcuts
  const { ShortcutsModal } = useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onHelp: () => setHelpOpen(true),
    onNavigate: (tab) => setActiveTab(tab as typeof activeTab),
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { id: "api-keys", label: "API Keys", icon: <FiKey /> },
    { id: "webhooks", label: "Webhooks", icon: <FiLink /> },
    { id: "request-logs", label: "Request Logs", icon: <FiClipboard /> },
    { id: "testing", label: "API Testing", icon: <FiPlay /> },
    { id: "playground", label: "Playground", icon: <FiPlay /> },
    { id: "events", label: "Events", icon: <FiFileText /> },
    { id: "quotas", label: "Quotas & Alerts", icon: <FiAlertTriangle /> },
    { id: "integrations", label: "Integrations", icon: <FiLink2 /> },
    { id: "docs", label: "Docs", icon: <FiBook /> },
    { id: "billing", label: "Billing", icon: <FiDollarSign /> },
    { id: "logs", label: "Logs", icon: <FiClipboard /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <DevNav userEmail={user?.email} orgName={user?.orgName} orgId={user?.orgId} />
      <div className="flex-1 transition-all duration-300 relative z-10" style={{ marginLeft: 'var(--sidebar-width, 180px)', marginTop: '64px' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {status && (
            <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-4 mb-6 animate-fade-in ${
              status.includes("✅") ? "shadow-green-200/50" : 
              status.includes("❌") ? "shadow-red-200/50" : 
              status.includes("🔄") ? "shadow-blue-200/50" : 
              "shadow-gray-200/50"
            }`}>
              <p className={`m-0 font-medium ${
                status.includes("✅") ? "text-green-700" : 
                status.includes("❌") ? "text-red-700" : 
                status.includes("🔄") ? "text-blue-700" : 
                "text-gray-900"
              }`}>
                {status}
              </p>
            </div>
          )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Overview</h2>
            {metrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="card bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                    <h3 className="text-sm opacity-90 mb-2">Webhooks</h3>
                    <div className="text-3xl font-bold">{metrics.webhooks.total}</div>
                    <p className="opacity-90 mt-2 text-sm whitespace-nowrap">{metrics.webhooks.active} active</p>
                  </div>
                  <div className="card bg-gradient-to-br from-secondary to-green-600 text-white">
                    <h3 className="text-sm opacity-90 mb-2">API Keys</h3>
                    <div className="text-3xl font-bold">{metrics.apiKeys.total}</div>
                    <p className="opacity-90 mt-2 text-sm">{metrics.apiKeys.activeLast24h} active (24h)</p>
                  </div>
                  <div className="card bg-gradient-to-br from-warning to-yellow-600 text-white">
                    <h3 className="text-sm opacity-90 mb-2">Events (24h)</h3>
                    <div className="text-3xl font-bold">{metrics.events.last24h}</div>
                    <p className="opacity-90 mt-2 text-sm">{metrics.events.last7d} in last 7 days</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Event Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Delivered</span>
                        <span className="badge badge-success">{metrics.events.byStatus.delivered}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Queued</span>
                        <span className="badge">{metrics.events.byStatus.queued}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Retrying</span>
                        <span className="badge badge-warning">{metrics.events.byStatus.retrying}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Failed</span>
                        <span className="badge badge-danger">{metrics.events.byStatus.failed}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Integrations</h3>
                    <div className="text-4xl font-bold text-blue-600">
                      {metrics.integrations.total}
                    </div>
                    <p className="text-gray-500 mt-2">Connected services</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-500">Loading metrics...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api-keys" && (
          <div className="space-y-6">
            <Collapsible title="Create API Key" defaultOpen={false}>
              <div className="space-y-4">
              
                <button
                  className="btn btn-secondary px-4 py-2 text-sm mb-4"
                  onClick={() => setShowApiKeyDocs(!showApiKeyDocs)}
                >
                  {showApiKeyDocs ? "Hide" : "Show"} Usage Guide
                </button>
              
              {showApiKeyDocs && (
                <div className="p-6 bg-gray-50 rounded-lg mb-6 border border-gray-200">
                  <h4 className="mb-4 text-gray-900 font-semibold">What are API Keys used for?</h4>
                  <p className="mb-4 text-gray-600 leading-relaxed">
                    API keys allow you to programmatically access the DEBBY API without logging in through the web interface. 
                    Use them for:
                  </p>
                  <ul className="mb-4 pl-6 text-gray-600 space-y-2 leading-relaxed">
                    <li><strong>Server-to-server integrations</strong> - Authenticate your backend services</li>
                    <li><strong>CI/CD pipelines</strong> - Automate deployments and webhook management</li>
                    <li><strong>Scripts & automation</strong> - Programmatically manage webhooks, events, and integrations</li>
                    <li><strong>Third-party tools</strong> - Connect external services without user interaction</li>
                    <li><strong>Monitoring & alerts</strong> - Build custom dashboards and monitoring tools</li>
                  </ul>
                  
                  <h4 className="mb-2 mt-6 font-semibold text-gray-900">Available Endpoints</h4>
                  <p className="mb-2 text-gray-600 text-sm">
                    API keys can access all developer endpoints:
                  </p>
                  <div className="bg-white p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <div className="mb-2">GET /developer/webhooks - List webhooks</div>
                    <div className="mb-2">POST /developer/webhooks - Create webhook</div>
                    <div className="mb-2">GET /developer/events - List events</div>
                    <div className="mb-2">GET /developer/stats - Get metrics</div>
                    <div className="mb-2">GET /developer/integrations - List integrations</div>
                    <div>POST /developer/integrations - Connect integration</div>
                  </div>

                  <h4 className="mb-2 mt-6 font-semibold text-gray-900">Usage Examples</h4>
                  <div className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto mb-4">
                    <div className="text-slate-400 mb-2"># Using curl (Linux/Mac/Git Bash)</div>
                    <div className="mb-4 whitespace-pre-wrap">
                      curl -X GET http://localhost:4000/developer/webhooks \<br />
                      &nbsp;&nbsp;-H "Authorization: Bearer ak_your_api_key_here"
                    </div>
                    
                    <div className="text-slate-400 mb-2"># Using PowerShell (Windows)</div>
                    <div className="mb-4 whitespace-pre-wrap">
                      $headers = @{'{'}<br />
                      &nbsp;&nbsp;'Authorization' = 'Bearer ak_your_api_key_here'<br />
                      {'}'}<br />
                      Invoke-RestMethod -Uri "http://localhost:4000/developer/webhooks" \<br />
                      &nbsp;&nbsp;-Method GET -Headers $headers
                    </div>
                    
                    <div className="text-slate-400 mb-2"># Using JavaScript/Node.js</div>
                    <div className="mb-4 whitespace-pre-wrap">
                      fetch('http://localhost:4000/developer/webhooks', {'{'}<br />
                      &nbsp;&nbsp;method: 'GET',<br />
                      &nbsp;&nbsp;headers: {'{'}<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer ak_your_api_key_here'<br />
                      &nbsp;&nbsp;{'}'}<br />
                      {'})'}<br />
                      &nbsp;&nbsp;.then(res =&gt; res.json())<br />
                      &nbsp;&nbsp;.then(data =&gt; console.log(data));
                    </div>
                    
                    <div className="text-slate-400 mb-2"># Using Python</div>
                    <div className="whitespace-pre-wrap">
                      import requests<br />
                      <br />
                      headers = {'{'}<br />
                      &nbsp;&nbsp;'Authorization': 'Bearer ak_your_api_key_here'<br />
                      {'}'}<br />
                      response = requests.get(<br />
                      &nbsp;&nbsp;'http://localhost:4000/developer/webhooks',<br />
                      &nbsp;&nbsp;headers=headers<br />
                      )<br />
                      print(response.json())
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                    <strong className="text-yellow-800">⚠️ Security Note:</strong>
                    <p className="mt-2 text-yellow-800 text-sm">
                      Never commit API keys to version control. Store them in environment variables or secret management systems.
                    </p>
                  </div>
                </div>
              )}

                <div className="flex gap-4">
                  <input
                    className="input flex-1"
                    placeholder="Key name (e.g., Production API, CI/CD Pipeline)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={createApiKey} disabled={!newKeyName}>
                    Create
                  </button>
                </div>
              </div>
            </Collapsible>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Your API Keys</h3>
              {apiKeys.length === 0 ? (
                <p className="text-gray-500">No API keys yet. Create one above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Last 4</th>
                        <th>Created</th>
                        <th>Last Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td>{key.name}</td>
                          <td><code className="px-2 py-1 bg-gray-100 rounded text-sm">••••{key.lastFour}</code></td>
                          <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                          <td>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <Collapsible title="Create Webhook" defaultOpen={false}>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                  <strong className="text-blue-900">💡 Free Test Webhooks (No Signup Required):</strong>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <code className="bg-white px-2 py-1 rounded cursor-pointer text-blue-600 hover:bg-blue-100" onClick={() => setNewWebhookUrl("https://httpbin.org/post")}>httpbin.org/post</code>
                    <code className="bg-white px-2 py-1 rounded cursor-pointer text-blue-600 hover:bg-blue-100" onClick={() => setNewWebhookUrl("https://postman-echo.com/post")}>postman-echo.com/post</code>
                    <span className="text-gray-600">or visit</span>
                    <a href="https://hooklistener.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">hooklistener.com</a>
                    <span className="text-gray-600">for a unique URL</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <input
                    className="input"
                    placeholder="Webhook URL (e.g., https://webhook.site/your-unique-id)"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Webhook secret"
                    value={newWebhookSecret}
                    onChange={(e) => setNewWebhookSecret(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder='Headers JSON (e.g., {"X-App":"demo"})'
                    value={newWebhookHeaders}
                    onChange={(e) => setNewWebhookHeaders(e.target.value)}
                  />
                  <div className="flex gap-4 items-center">
                    <label className="label mb-0">Max Retries:</label>
                    <input
                      type="number"
                      className="input w-24"
                      value={newWebhookRetries}
                      onChange={(e) => setNewWebhookRetries(Number(e.target.value))}
                    />
                    <button className="btn btn-primary ml-auto" onClick={createWebhook}>
                      Create Webhook
                    </button>
                  </div>
                </div>
              </div>
            </Collapsible>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Webhooks</h3>
              {webhooks.length === 0 ? (
                <p className="text-gray-500">No webhooks yet. Create one above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>Status</th>
                        <th>Retries</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhooks.map((hook) => (
                        <tr key={hook.id}>
                          <td><code className="text-xs px-2 py-1 bg-gray-100 rounded">{hook.url}</code></td>
                          <td>
                            <span className={hook.enabled ? "badge badge-success" : "badge badge-danger"}>
                              {hook.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </td>
                          <td>{hook.maxRetries}</td>
                          <td>{new Date(hook.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-secondary px-4 py-2 text-xs"
                              onClick={async () => {
                                try {
                                  await apiRequest(`/developer/webhooks/${hook.id}/test`, {
                                    method: "POST",
                                    accessToken,
                                    body: {
                                      eventType: "test_event",
                                      payload: { message: "Test webhook from dashboard", timestamp: new Date().toISOString() }
                                    }
                                  });
                                  setStatus("✅ Test webhook sent! Check Events tab to see the delivery.");
                                  await loadData();
                                } catch (err) {
                                  setStatus(`❌ Test failed: ${(err as Error).message}`);
                                }
                              }}
                              disabled={!hook.enabled}
                            >
                              Test
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeEventTab === 'webhooks' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setActiveEventTab('webhooks')}
                >
                  Webhook Logs
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeEventTab === 'github' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setActiveEventTab('github')}
                >
                  GitHub Activity
                </button>
              </div>
            </div>

            {activeEventTab === 'github' ? (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent GitHub Activity (Monitored)</h3>
                {githubEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent GitHub events found or not connected.</p>
                    <button 
                      className="btn btn-primary mt-4" 
                      onClick={() => window.location.href = `https://github.com/login/oauth/authorize?client_id=Iv23li98s9s8s&scope=user:email,repo`}
                    >
                      Connect GitHub (if not connected)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {githubEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.type === 'PushEvent' ? 'bg-blue-100 text-blue-600' :
                            event.type === 'PullRequestEvent' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {event.type === 'PushEvent' ? <FiClipboard /> : <FiLink2 />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                <span className="font-bold">{event.actor}</span> {event.type.replace('Event', '')}
                              </p>
                              <p className="text-sm text-gray-500">
                                in <span className="font-mono text-xs bg-gray-100 px-1 rounded">{event.repo}</span>
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {event.type === 'PushEvent' && (
                            <div className="mt-2 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                              {event.payload?.commits?.[0]?.message || "No commit message"}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Webhook Logs (Existing)
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">What are Events?</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Events track webhook deliveries to your endpoints. Each event represents a webhook payload that was sent 
                    to one of your configured webhook URLs.
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                    <strong className="text-blue-900">💡 Tip:</strong> <span className="text-blue-800">Click "History" on any event to see detailed delivery attempts.</span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Event Logs</h3>
                  {events.length === 0 ? (
                    <div>
                      <p className="text-gray-500 mb-4">No events yet.</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Event Type</th>
                              <th>Status</th>
                              <th>Attempts</th>
                              <th>Status Code</th>
                              <th>Created</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {events.map((event) => (
                              <tr key={event.id}>
                                <td>{event.eventType}</td>
                                <td><span className={getStatusBadge(event.status)}>{event.status}</span></td>
                                <td>{event.attempts}</td>
                                <td>{event.lastStatusCode || "-"}</td>
                                <td>{new Date(event.createdAt).toLocaleString()}</td>
                                <td>
                                  <button
                                    className="btn btn-secondary px-4 py-2 text-xs"
                                    onClick={() => loadEventHistory(event.id)}
                                  >
                                    History
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {selectedEventId && eventHistory.length > 0 && (
                        <div className="card mt-8">
                          <h4 className="text-lg font-semibold mb-4 text-gray-900">Delivery History</h4>
                          <div className="overflow-x-auto">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Attempt</th>
                                  <th>Status</th>
                                  <th>Duration</th>
                                  <th>Headers Sent</th>
                                  <th>Error/Response</th>
                                  <th>Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eventHistory.map((attempt) => (
                                  <tr key={attempt.id}>
                                    <td>{attempt.attemptNumber}</td>
                                    <td>
                                      {attempt.statusCode ? (
                                        <span className={attempt.statusCode >= 200 && attempt.statusCode < 300 ? "badge badge-success" : "badge badge-danger"}>
                                          {attempt.statusCode}
                                        </span>
                                      ) : (
                                        <span className="badge badge-danger">Error</span>
                                      )}
                                    </td>
                                    <td>{attempt.durationMs}ms</td>
                                    <td className="max-w-xs">
                                      {attempt.headersSent ? (
                                        <details className="cursor-pointer">
                                          <summary className="text-sm text-gray-500">
                                            View Headers
                                          </summary>
                                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                                            {JSON.stringify(attempt.headersSent, null, 2)}
                                          </pre>
                                        </details>
                                      ) : (
                                        <span className="text-gray-500">-</span>
                                      )}
                                    </td>
                                    <td className="max-w-xs truncate">
                                      {attempt.errorMessage?.slice(0, 50) || attempt.responseBody?.slice(0, 50) || "-"}
                                    </td>
                                    <td>{new Date(attempt.startedAt).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <Collapsible title="Connect Integration" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <select
                    className="input w-48"
                    value={integrationProvider}
                    onChange={(e) => setIntegrationProvider(e.target.value)}
                  >
                    <option value="stripe">Stripe</option>
                    <option value="paystack">Paystack</option>
                    <option value="github">GitHub</option>
                  </select>
                  <input
                    className="input flex-1 min-w-[200px]"
                    type="password"
                    placeholder={
                      integrationProvider === "paystack" 
                        ? "Paystack Secret Key (sk_live_... or sk_test_...)" 
                        : integrationProvider === "stripe"
                        ? "Stripe Secret Key (sk_live_... or sk_test_...)"
                        : "Access token"
                    }
                    value={integrationToken}
                    onChange={(e) => setIntegrationToken(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={connectIntegration} disabled={!integrationToken}>
                    Connect
                  </button>
                </div>
                {integrationProvider === "paystack" && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900 border border-blue-200">
                    <strong>ℹ️ Note:</strong> Use your Paystack <strong>Secret Key</strong> (starts with <code className="px-1 py-0.5 bg-white rounded">sk_live_</code> or <code className="px-1 py-0.5 bg-white rounded">sk_test_</code>), 
                    not your public key. You can find it in your Paystack Dashboard → Settings → API Keys & Webhooks.
                  </div>
                )}
              </div>
            </Collapsible>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Connected Integrations</h3>
              {integrations.length === 0 ? (
                <p className="text-gray-500">No integrations connected yet.</p>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const testResult = testResults[integration.provider];
                    return (
                      <div
                        key={integration.provider}
                        className={`p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                          testResult 
                            ? testResult.success ? "shadow-green-200/50" : "shadow-red-200/50"
                            : "shadow-gray-200/30"
                        }`}
                      >
                        <div className={`flex justify-between items-center ${testResult ? "mb-3" : ""}`}>
                          <div>
                            <strong className="capitalize text-gray-900">{integration.provider}</strong>
                            <p className="mt-1 text-sm text-gray-500">
                              Connected {new Date(integration.connectedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary px-4 py-2 text-xs"
                              onClick={() => testIntegration(integration.provider)}
                              disabled={testingIntegration === integration.provider}
                            >
                              {testingIntegration === integration.provider ? "Testing..." : "Test"}
                            </button>
                            <button
                              className="btn btn-danger px-4 py-2 text-xs"
                              onClick={() => disconnectIntegration(integration.provider)}
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                        {testResult && (
                          <div className={`p-3 rounded-lg ${
                            testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{testResult.success ? "✅" : "❌"}</span>
                              <span className={`font-medium ${
                                testResult.success ? "text-green-800" : "text-red-800"
                              }`}>
                                {testResult.message}
                              </span>
                            </div>
                            {testResult.data && (
                              <div className={`mt-2 text-xs font-mono ${
                                testResult.success ? "text-green-700" : "text-red-700"
                              }`}>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(testResult.data, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Security Logs</h3>
            {logs.length === 0 ? (
              <p className="text-gray-500">No security logs yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.eventType}</td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
            <Collapsible title="Profile Settings" defaultOpen={true}>
              <div className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    disabled
                    value={user?.email || ""}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Contact support to change your email address
                  </p>
                </div>
                <div>
                  <label className="label">Change Password</label>
                  <input
                    type="password"
                    className="input mb-2"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="input mb-2"
                    placeholder="New password (min 12 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={handleUpdatePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </Collapsible>

            {/* Organization Settings - Only visible on small screens */}
            <div className="md:hidden">
              <Collapsible title="Organization Settings" defaultOpen={false}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Organization Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Your Organization"
                      disabled
                      value={user?.orgName || ""}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Organization name cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="label">Organization ID</label>
                    <input
                      type="text"
                      className="input"
                      disabled
                      value={user?.orgId || ""}
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      className="input"
                      disabled
                      value={user?.email || ""}
                    />
                  </div>
                </div>
              </Collapsible>
            </div>

            {/* API Preferences */}
            <Collapsible title="API Preferences" defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <label className="label">Default Webhook Timeout (seconds)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="30"
                    min="5"
                    max="300"
                  />
                </div>
                <div>
                  <label className="label">Default Retry Attempts</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="3"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-400" />
                    <span className="text-gray-700">Auto-retry failed webhooks</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 italic">API preferences are coming soon...</p>
              </div>
            </Collapsible>

            {/* Danger Zone */}
            <Collapsible title="Danger Zone" defaultOpen={false}>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-red-50/80 to-rose-50/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-red-200/30">
                  <h4 className="font-bold text-red-900 mb-2 text-lg">Delete Account</h4>
                  {hasPendingDeletion ? (
                    <div>
                      <p className="text-sm text-red-700 mb-2">
                        You have a pending account deletion request.
                      </p>
                      <p className="text-sm text-red-600 mb-4">
                        Your account will be permanently deleted on:{" "}
                        <strong>{deletionScheduledAt ? new Date(deletionScheduledAt).toLocaleDateString() : "N/A"}</strong>
                      </p>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleCancelDeletion}
                      >
                        Cancel Deletion Request
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button 
                        className="btn btn-danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {/* Webhook Playground Tab */}
        {activeTab === "playground" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Webhook Playground</h2>
                <p className="text-gray-500 mt-1">Test your webhooks with custom payloads</p>
              </div>
            </div>
            <div className="card">
              <WebhookPlayground />
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === "docs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Documentation</h2>
                <p className="text-gray-500 mt-1">API guides and code examples</p>
              </div>
              <button
                onClick={() => setHelpOpen(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FiHelpCircle className="w-4 h-4" />
                Open Help Center
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Start</h3>
                <div className="space-y-3">
                  <a href="#" onClick={(e) => { e.preventDefault(); setHelpOpen(true); }} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiBook className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">Getting Started Guide</span>
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("api-keys"); }} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiKey className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">API Keys Management</span>
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("webhooks"); }} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiLink className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900">Webhook Configuration</span>
                  </a>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Code Snippets</h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-400 mb-2">// Create a payment</div>
                  <div className="text-blue-400">const</div>
                  <span className="text-white"> response = </span>
                  <span className="text-yellow-400">await</span>
                  <span className="text-white"> fetch(</span>
                  <span className="text-green-400">'/api/payments'</span>
                  <span className="text-white">, {"{"}</span>
                  <div className="pl-4 text-white">
                    method: <span className="text-green-400">'POST'</span>,
                  </div>
                  <div className="pl-4 text-white">
                    headers: {"{"} <span className="text-green-400">'Authorization'</span>: <span className="text-green-400">`Bearer ${"$"}{"{"}apiKey{"}"}`</span> {"}"}
                  </div>
                  <span className="text-white">{"}"});</span>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Webhook Signature Verification</h3>
                <p className="text-gray-600 text-sm mb-4">
                  All webhooks are signed using HMAC-SHA256. Verify signatures to ensure authenticity.
                </p>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="btn btn-primary w-full"
                >
                  Try in Playground
                </button>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">SDKs & Libraries</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Node.js", "Python", "PHP", "Ruby", "Go", "Java"].map(lang => (
                    <div key={lang} className="p-2 bg-gray-50 rounded text-center text-sm text-gray-700">
                      {lang}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">Coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">API Usage Analytics</h2>
            <div className="card">
              <p className="text-gray-500">Analytics dashboard with charts will be displayed here. Backend API ready at <code>/developer/analytics/usage</code> and <code>/developer/analytics/webhooks</code></p>
            </div>
          </div>
        )}

        {/* Request Logs Tab */}
        {activeTab === "request-logs" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">API Request Logs</h2>
            <div className="card">
              <p className="text-gray-500">Request logs table with filters will be displayed here. Backend API ready at <code>/developer/request-logs</code></p>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === "testing" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">API Testing Console</h2>
            <div className="card">
              <p className="text-gray-500">Interactive API testing console will be displayed here. Backend API ready at <code>/developer/test-api</code></p>
            </div>
          </div>
        )}

        {/* Quotas & Alerts Tab */}
        {activeTab === "quotas" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Quotas & Alerts</h2>
            <div className="card">
              <p className="text-gray-500">Quotas and alerts management UI will be displayed here. Backend APIs ready at <code>/developer/quotas</code> and <code>/developer/alerts</code></p>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Billing & Plans</h2>
                <p className="text-gray-500 mt-1">Manage your subscription and usage</p>
              </div>
            </div>
            <BillingPlans role="developer" />
          </div>
        )}
        </div>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(result) => {
          if (result.type === "apiKey") setActiveTab("api-keys");
          else if (result.type === "webhook") setActiveTab("webhooks");
          else if (result.type === "event") setActiveTab("events");
        }}
        role="developer"
      />
      
      {/* Help Center Modal */}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <Onboarding
          role="developer"
          onComplete={() => setShowOnboarding(false)}
          onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
        />
      )}
      
      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal />
      
      {/* Delete Account Modal - Step 1 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
        footer={
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => {
                setShowDeleteModal(false);
                setShowDeleteConfirmModal(true);
              }}
            >
              Continue
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50/70 rounded-lg">
            <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Warning: This action is irreversible</h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Your account data will be permanently deleted after <strong>30 days</strong></li>
                <li>You will <strong>NOT</strong> be able to create another account with this email</li>
                <li>All your API keys, webhooks, and integrations will be removed</li>
              </ul>
            </div>
          </div>
          <div>
            <label className="label">Reason for leaving (optional)</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Tell us why you're leaving..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
      
      {/* Delete Account Modal - Step 2 Confirmation */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Are you absolutely sure?"
        size="md"
        footer={
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={deletionLoading}
            >
              Go Back
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleRequestDeletion}
              disabled={deletionLoading}
            >
              {deletionLoading ? "Processing..." : "Yes, Delete My Account"}
            </button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 mb-4">
            This will submit a deletion request. Your account and all associated data will be 
            <strong className="text-red-600"> permanently deleted after 30 days</strong>.
          </p>
          <p className="text-sm text-gray-500">
            You can cancel this request within the 30-day period from your Settings page.
          </p>
        </div>
      </Modal>
    </div>
  );
};
