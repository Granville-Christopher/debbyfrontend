import React, { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend as ChartLegend,
  LinearScale,
  Tooltip as ChartTooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FiTrendingUp, FiTrendingDown, FiActivity, FiDollarSign, FiBell, FiZap } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, ChartLegend);

type Period = "24h" | "7d" | "30d" | "90d";

interface AnalyticsDashboardProps {
  type: "developer" | "business";
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ type }) => {
  const { accessToken } = useAuth();
  const [period, setPeriod] = useState<Period>("7d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [accessToken, period]);

  const loadAnalytics = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      if (type === "developer") {
        const [apiUsage, webhooks] = await Promise.all([
          apiRequest<any>(`/analytics/api-usage?period=${period}`, { accessToken }),
          apiRequest<any>(`/analytics/webhook-deliveries?period=${period}`, { accessToken }),
        ]);
        setData({ apiUsage, webhooks });
      } else {
        const [revenue, notifications, payments] = await Promise.all([
          apiRequest<any>(`/analytics/revenue?period=${period}`, { accessToken }),
          apiRequest<any>(`/analytics/notifications?period=${period}`, { accessToken }),
          apiRequest<any>(`/analytics/payments?period=${period}`, { accessToken }),
        ]);
        setData({ revenue, notifications, payments });
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderDeveloperAnalytics = () => {
    const { apiUsage, webhooks } = data || {};
    
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="API Calls"
            value={formatNumber(apiUsage?.total || 0)}
            icon={<FiActivity className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Avg Response Time"
            value={`${apiUsage?.avgResponseTime || 0}ms`}
            icon={<FiZap className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Webhook Deliveries"
            value={formatNumber(webhooks?.total || 0)}
            icon={<FiBell className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="Delivery Success Rate"
            value={`${webhooks?.successRate || 0}%`}
            icon={<FiTrendingUp className="w-5 h-5" />}
            color="emerald"
            trend={webhooks?.successRate >= 95 ? "up" : webhooks?.successRate >= 80 ? "neutral" : "down"}
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* API Calls by Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Calls by Status</h3>
            <div className="space-y-3">
              {Object.entries(apiUsage?.byStatus || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === "2xx" ? "bg-green-500" :
                      status === "4xx" ? "bg-yellow-500" :
                      status === "5xx" ? "bg-red-500" : "bg-gray-500"
                    }`}></div>
                    <span className="text-gray-700">{status}</span>
                  </div>
                  <span className="font-medium">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Webhook Deliveries by Event Type */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deliveries by Event Type</h3>
            <div className="space-y-3">
              {Object.entries(webhooks?.byEventType || {}).slice(0, 5).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate max-w-[200px]">{type}</span>
                  <span className="font-medium">{formatNumber(count)}</span>
                </div>
              ))}
              {Object.keys(webhooks?.byEventType || {}).length === 0 && (
                <p className="text-gray-500 text-sm">No webhook deliveries yet</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Timeline Chart */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Calls Over Time</h3>
          <SimpleBarChart data={apiUsage?.timeline || []} />
        </div>
      </>
    );
  };

  const renderBusinessAnalytics = () => {
    const { revenue, notifications, payments } = data || {};
    
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(revenue?.totalRevenue || 0)}
            icon={<FiDollarSign className="w-5 h-5" />}
            color="green"
            trend={revenue?.growth > 0 ? "up" : revenue?.growth < 0 ? "down" : "neutral"}
            trendValue={revenue?.growth ? `${revenue.growth > 0 ? "+" : ""}${revenue.growth}%` : undefined}
          />
          <StatCard
            title="Transactions"
            value={formatNumber(revenue?.transactionCount || 0)}
            icon={<FiActivity className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Notifications Sent"
            value={formatNumber(notifications?.sent || 0)}
            icon={<FiBell className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="Delivery Rate"
            value={`${notifications?.deliveryRate || 0}%`}
            icon={<FiTrendingUp className="w-5 h-5" />}
            color="emerald"
            trend={notifications?.deliveryRate >= 95 ? "up" : notifications?.deliveryRate >= 80 ? "neutral" : "down"}
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Revenue by Currency */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Currency</h3>
            <div className="space-y-3">
              {Object.entries(revenue?.byCurrency || {}).map(([currency, amount]: [string, any]) => (
                <div key={currency} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{currency}</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency,
                      minimumFractionDigits: 0,
                    }).format(amount)}
                  </span>
                </div>
              ))}
              {Object.keys(revenue?.byCurrency || {}).length === 0 && (
                <p className="text-gray-500 text-sm">No revenue data yet</p>
              )}
            </div>
          </div>
          
          {/* Notifications by Channel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications by Channel</h3>
            <div className="space-y-3">
              {Object.entries(notifications?.byChannel || {}).map(([channel, stats]: [string, any]) => (
                <div key={channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      channel === "email" ? "bg-blue-500" :
                      channel === "sms" ? "bg-green-500" : "bg-purple-500"
                    }`}></div>
                    <span className="text-gray-700 capitalize">{channel}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">{stats.sent} sent</span>
                    {stats.failed > 0 && (
                      <span className="text-red-600 ml-2">{stats.failed} failed</span>
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(notifications?.byChannel || {}).length === 0 && (
                <p className="text-gray-500 text-sm">No notifications yet</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Revenue Timeline */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <SimpleBarChart data={revenue?.timeline || []} valueKey="amount" isCurrency />
        </div>
        
        {/* Payment Status */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(payments?.byStatus || {}).map(([status, stats]: [string, any]) => (
              <div key={status} className="bg-gray-50/70 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold ${
                  status === "completed" ? "text-green-600" :
                  status === "failed" ? "text-red-600" :
                  status === "processing" ? "text-blue-600" : "text-gray-600"
                }`}>
                  {stats.count}
                </p>
                <p className="text-sm text-gray-500 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex gap-2">
          {(["24h", "7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      {type === "developer" ? renderDeveloperAnalytics() : renderBusinessAnalytics()}
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "emerald" | "red" | "yellow";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
            }`}>
              {trend === "up" ? <FiTrendingUp /> : trend === "down" ? <FiTrendingDown /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
interface SimpleBarChartProps {
  data: Array<{ hour?: string; day?: string; count?: number; amount?: number }>;
  valueKey?: "count" | "amount";
  isCurrency?: boolean;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, valueKey = "count", isCurrency = false }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">No data available for this period</p>;
  }

  const rows = (data || []).slice(-30);
  const labels = rows.map((item) => item.hour?.slice(11, 16) || item.day?.slice(5) || "");
  const values = rows.map((item) => Number(item[valueKey] || 0));
  const chartData = {
    labels,
    datasets: [
      {
        label: isCurrency ? "Revenue" : "Count",
        data: values,
        backgroundColor: "rgba(59, 130, 246, 0.82)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 18,
        categoryPercentage: 0.82
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = Number(context?.parsed?.y ?? context?.parsed ?? 0);
            return isCurrency
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
              : value.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10, weight: 500 as const }, maxRotation: 0, autoSkip: true }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(203, 213, 225, 0.5)", borderDash: [4, 4] },
        ticks: {
          color: "#64748b",
          font: { size: 10, weight: 500 as const },
          callback: (value: number | string) =>
            isCurrency
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                  Number(value || 0)
                )
              : Number(value || 0).toLocaleString()
        }
      }
    }
  };

  return (
    <div className="h-56">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default AnalyticsDashboard;
