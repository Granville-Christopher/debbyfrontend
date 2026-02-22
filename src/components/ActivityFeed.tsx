import React, { useState, useEffect, useCallback } from "react";
import { 
  FiCreditCard, FiBell, FiCheck, FiX, FiClock, FiRefreshCw,
  FiMail, FiMessageSquare, FiPhone
} from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface Activity {
  id: string;
  type: "payment" | "notification";
  status: string;
  amount?: number;
  currency?: string;
  channel?: string;
  recipient: string;
  description?: string;
  message?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  className = "",
  limit = 20,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const { accessToken } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivities = useCallback(async (showLoading = true) => {
    if (!accessToken) return;
    if (showLoading) setLoading(true);
    setIsRefreshing(!showLoading);
    
    try {
      const res = await apiRequest<{ activities: Activity[]; hasMore: boolean }>(
        `/business/activity-feed?limit=${limit}`,
        { accessToken }
      );
      setActivities(res.activities);
      setHasMore(res.hasMore);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchActivities(false), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  const loadMore = async () => {
    if (!accessToken || !hasMore || loading) return;
    const lastActivity = activities[activities.length - 1];
    if (!lastActivity) return;
    
    setLoading(true);
    try {
      const res = await apiRequest<{ activities: Activity[]; hasMore: boolean }>(
        `/business/activity-feed?limit=${limit}&before=${lastActivity.createdAt}`,
        { accessToken }
      );
      setActivities(prev => [...prev, ...res.activities]);
      setHasMore(res.hasMore);
    } catch (error) {
      console.error("Failed to load more activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.type === "payment") {
      return <FiCreditCard className="w-4 h-4" />;
    }
    
    switch (activity.channel) {
      case "email": return <FiMail className="w-4 h-4" />;
      case "sms": return <FiPhone className="w-4 h-4" />;
      case "whatsapp": return <FiMessageSquare className="w-4 h-4" />;
      default: return <FiBell className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "sent":
        return <FiCheck className="w-3.5 h-3.5 text-green-500" />;
      case "failed":
        return <FiX className="w-3.5 h-3.5 text-red-500" />;
      case "queued":
      case "processing":
        return <FiClock className="w-3.5 h-3.5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "queued":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
        <h3 className="font-semibold text-gray-900">Activity Feed</h3>
        <button
          onClick={() => fetchActivities(false)}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FiBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map(activity => (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-4 hover:bg-gray-50/50 transition-colors"
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                activity.type === "payment" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              }`}>
                {getActivityIcon(activity)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {activity.type === "payment" 
                      ? `${activity.amount} ${activity.currency}` 
                      : activity.channel?.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                    {activity.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {activity.recipient}
                </p>
                {(activity.description || activity.message) && (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {activity.description || activity.message}
                  </p>
                )}
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(activity.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="px-4 py-3 border-t border-gray-200/50">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

// Compact version for dashboard widgets
interface ActivityWidgetProps {
  maxItems?: number;
}

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({ maxItems = 5 }) => {
  const { accessToken } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!accessToken) return;
      try {
        const res = await apiRequest<{ activities: Activity[] }>(
          `/business/activity-feed?limit=${maxItems}`,
          { accessToken }
        );
        setActivities(res.activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [accessToken, maxItems]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <FiBell className="w-6 h-6 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${
            activity.type === "payment" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
          }`}>
            {activity.type === "payment" ? (
              <FiCreditCard className="w-3.5 h-3.5" />
            ) : (
              <FiBell className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.type === "payment" 
                ? `${activity.amount} ${activity.currency}` 
                : activity.recipient}
            </p>
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            activity.status === "completed" || activity.status === "sent"
              ? "bg-green-100 text-green-700"
              : activity.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}>
            {activity.status}
          </span>
        </div>
      ))}
    </div>
  );
};
