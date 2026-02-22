import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatorNav } from "../components/CreatorNav";
import { useAuth } from "../auth/AuthProvider";
import { Role } from "../auth/AuthProvider";
import { apiRequest } from "../api/client";
import { Collapsible } from "../components/Collapsible";
import { Sidebar } from "../components/Sidebar";
import { Modal, ConfirmModal } from "../components/Modal";
import { GlobalSearch, useGlobalSearch } from "../components/GlobalSearch";
import { Onboarding, useOnboarding } from "../components/Onboarding";
import { HelpCenter, useHelpCenter } from "../components/HelpCenter";
import { useKeyboardShortcuts } from "../components/KeyboardShortcuts";
import {
  FiBarChart2,
  FiCalendar,
  FiLink2,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiHelpCircle,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiFileText,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiRepeat,
  FiSend,
  FiPause,
  FiPlay,
  FiSave,
  FiExternalLink,
  FiCopy,
  FiGrid,
  FiUser,
  FiRefreshCw
} from "react-icons/fi";
import { FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { BillingPlans, CurrentPlanModal } from "../components/BillingPlans";

// Types
type SocialAccount = {
  id: string;
  platform: "x" | "threads" | "linkedin" | "instagram";
  username: string;
  displayName: string;
  profileImageUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  connected: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
};

type ScheduledPost = {
  id: string;
  content: string;
  mediaUrls?: string[];
  platform: "x" | "threads" | "linkedin" | "instagram";
  accountId: string;
  accountUsername?: string;
  scheduledFor: string;
  status: "draft" | "scheduled" | "published" | "failed" | "cancelled" | "queued";
  errorMessage?: string;
  publishedAt?: string;
  createdAt: string;
  threadItems?: Array<{
    id: string;
    order: number;
    content: string;
    mediaUrls: string[];
  }>;
  engagement?: {
    likes: number;
    comments: number;
    reposts: number;
    views: number;
  };
  performance?: {
    likes: number;
    comments: number;
    reposts: number;
    views: number;
    engagementRate: number;
  };
};

type PostTemplate = {
  id: string;
  name: string;
  content: string;
  category: string;
  mediaUrls?: string[];
  tags?: string[];
  usageCount?: number;
  createdAt: string;
  updatedAt?: string;
};

type MediaFile = {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  tags: string[];
  createdAt: string;
};

type HashtagAnalytic = {
  hashtag: string;
  platform: string;
  usageCount: number;
  totalEngagement: number;
  avgEngagement: number;
  lastUsedAt: string | null;
};

type OptimalTime = {
  dayOfWeek: number;
  hour: number;
  engagementScore: number;
  dayName: string;
  timeString: string;
};

type ContentSuggestion = {
  suggestion: string;
  reason: string;
  category: string;
};

type AnalyticsData = {
  totalFollowers: number;
  followerGrowth: number;
  totalEngagement: number;
  engagementRate: number;
  engagementRateChange?: number;
  totalPosts: number;
  scheduledPosts: number;
  avgLikes?: number;
  avgComments?: number;
  likesChange?: number;
  commentsChange?: number;
  bestPostingTime?: string;
  topPosts: ScheduledPost[];
  dailyStats: Array<{
    date: string;
    followers: number;
    engagement: number;
    posts: number;
  }>;
};

type CreatorTier = "free" | "basic" | "pro" | "starter" | "professional" | "enterprise";

// Mock data for demo purposes
const mockAccounts: SocialAccount[] = [];
const mockPosts: ScheduledPost[] = [];
const mockTemplates: PostTemplate[] = [
  { id: "1", name: "Announcement", content: "🚀 Exciting news! [Your announcement here]\n\n#announcement #news", category: "General", createdAt: new Date().toISOString() },
  { id: "2", name: "Question", content: "🤔 Quick question for you all:\n\n[Your question here]\n\nDrop your thoughts below! 👇", category: "Engagement", createdAt: new Date().toISOString() },
  { id: "3", name: "Thread Starter", content: "🧵 Thread time!\n\n[Topic introduction]\n\n1/ [First point]", category: "Threads", createdAt: new Date().toISOString() },
];

export const CreatorDashboard = () => {
  const { accessToken, csrfToken, refresh, user, role, logout, updateRole } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "scheduler" | "analytics" | "templates" | "billing" | "settings">("overview");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Preferences state
  const [preferences, setPreferences] = useState({
    timezone: "UTC",
    emailScheduledPosts: true,
    emailWeeklyDigest: true,
    emailPostFailures: true
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Load preferences
  const loadPreferences = async () => {
    try {
      const response = await apiRequest("/auth/preferences", { accessToken });
      setPreferences({
        timezone: response.timezone || "UTC",
        emailScheduledPosts: response.emailScheduledPosts ?? true,
        emailWeeklyDigest: response.emailWeeklyDigest ?? true,
        emailPostFailures: response.emailPostFailures ?? true
      });
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setPreferencesLoading(true);
    try {
      await apiRequest("/auth/preferences", {
        method: "PUT",
        accessToken,
        csrfToken,
        body: preferences
      });
      setStatus("✅ Preferences saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      setStatus(`❌ Failed to save preferences: ${error.response?.data?.error || error.message}`);
    } finally {
      setPreferencesLoading(false);
    }
  };
  
  // Data state
  const [accounts, setAccounts] = useState<SocialAccount[]>(mockAccounts);
  const [posts, setPosts] = useState<ScheduledPost[]>(mockPosts);
  const [templates, setTemplates] = useState<PostTemplate[]>(mockTemplates);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tier, setTier] = useState<CreatorTier>("free");
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([]);
  const [hashtagAnalytics, setHashtagAnalytics] = useState<HashtagAnalytic[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [calendarView, setCalendarView] = useState<Record<string, ScheduledPost[]>>({});
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all"); // Platform filter for overview and other sections
  
  // UI state
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showThreadBuilder, setShowThreadBuilder] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<"x" | "threads" | "linkedin" | "instagram">("x");
  const [connecting, setConnecting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedAccountForOptimal, setSelectedAccountForOptimal] = useState<string | null>(null);
  
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 500);
  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--sidebar-width",
      isCollapsed ? (isSmall ? "40px" : "80px") : "280px",
    );
  }, [isCollapsed, isSmall]);


  // Form state
  const [postForm, setPostForm] = useState({
    content: "",
    platform: "x" as "x" | "threads" | "linkedin" | "instagram",
    accountId: "",
    scheduledFor: "",
    mediaUrls: [] as string[],
    status: "scheduled" as "draft" | "scheduled",
    threadItems: [] as Array<{ content: string; mediaUrls: string[] }>,
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    category: "General",
    mediaUrls: [] as string[],
    tags: [] as string[],
  });
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PostTemplate | null>(null);
  const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);

  // Hooks
  const { isOpen: isSearchOpen, setIsOpen: setIsSearchOpen } = useGlobalSearch();
  const { isOpen: isHelpOpen, setIsOpen: setIsHelpOpen } = useHelpCenter();
  const { showOnboarding, setShowOnboarding } = useOnboarding(role || "creator");
  
  useKeyboardShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onHelp: () => setIsHelpOpen(true),
    onNew: () => {
      if (activeTab === "scheduler") setShowPostModal(true);
      if (activeTab === "templates") setShowTemplateModal(true);
    },
  });

  // Load current plan function
  const loadCurrentPlan = async () => {
    try {
      const subResponse = await apiRequest<{ plan: any }>("/billing/subscription", {
        accessToken,
        csrfToken
      });
      if (subResponse.plan) {
        const newPlan = subResponse.plan.id;
        if (newPlan !== currentPlan) {
          console.log(`[CreatorDashboard] Plan updated from ${currentPlan} to ${newPlan}`);
          setTier(newPlan as CreatorTier);
          setCurrentPlan(newPlan);
          setStatus(`✅ Plan updated to ${newPlan} (${(newPlan as string).toUpperCase()})`);
        }
      }
    } catch (planErr) {
      console.warn("Failed to load subscription:", planErr);
    }
  };

  // Load data function
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Check for OAuth callback parameters if not silent
      if (!silent) {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthSuccess = urlParams.get('oauth_success');
        const oauthError = urlParams.get('oauth_error');

        if (oauthSuccess) {
          setStatus("✅ Account connected successfully!");
          window.history.replaceState({}, '', window.location.pathname);
        } else if (oauthError) {
          setStatus(`❌ Failed to connect account: ${oauthError}`);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      // Load available plans
      try {
        const plansResponse = await apiRequest<{ plans: any[] }>("/billing/plans?role=creator", {
          accessToken,
          csrfToken
        });
        setAvailablePlans(plansResponse.plans);
      } catch (plansErr) {
        console.warn("Failed to load plans:", plansErr);
      }

      // Load real accounts
      try {
        const accountsResponse = await apiRequest<{ accounts: SocialAccount[] }>("/creator/accounts", {
          accessToken,
          csrfToken
        });
        setAccounts(accountsResponse.accounts);
      } catch (accountsErr) {
        if (!silent) setAccounts([]);
      }

      // Load posts (including drafts and published)
      try {
        const postsResponse = await apiRequest<{ posts: any[] }>("/creator/posts?includeDrafts=true&limit=200", {
          accessToken,
          csrfToken
        });
        // Map posts to include platform from account
        const mappedPosts = postsResponse.posts.map((post: any) => ({
          ...post,
          platform: post.account?.platform || post.platform || "x",
          accountUsername: post.account?.username || post.accountUsername
        }));
        setPosts(mappedPosts);
        console.log("Loaded posts:", mappedPosts.length, "Published:", mappedPosts.filter(p => p.status === "published").length);
      } catch (postsErr) {
        console.error("Failed to load posts:", postsErr);
        if (!silent) setPosts([]);
      }

      // Load templates from backend
      try {
        const templatesResponse = await apiRequest<{ templates: PostTemplate[] }>("/creator/templates", {
          accessToken,
          csrfToken
        });
        setTemplates(templatesResponse.templates);
      } catch (templatesErr) {
        if (!silent) setTemplates([]);
      }

      // Load media library
      try {
        const mediaResponse = await apiRequest<{ media: MediaFile[] }>("/creator/media", {
          accessToken,
          csrfToken
        });
        setMediaLibrary(mediaResponse.media);
      } catch (mediaErr) {
        if (!silent) setMediaLibrary([]);
      }

      // Load hashtag analytics
      try {
        const hashtagsResponse = await apiRequest<{ analytics: HashtagAnalytic[] }>("/creator/hashtags/analytics", {
          accessToken,
          csrfToken
        });
        setHashtagAnalytics(hashtagsResponse.analytics);
      } catch (hashtagsErr) {
        if (!silent) setHashtagAnalytics([]);
      }

      // Load content suggestions
      try {
        const suggestionsResponse = await apiRequest<{ suggestions: ContentSuggestion[] }>("/creator/content/suggestions", {
          accessToken,
          csrfToken
        });
        setContentSuggestions(suggestionsResponse.suggestions);
      } catch (suggestionsErr) {
        if (!silent) setContentSuggestions([]);
      }

      // Load calendar view
      try {
        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const calendarResponse = await apiRequest<{ calendar: Record<string, any[]> }>(
          `/creator/posts/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          { accessToken, csrfToken }
        );
        // Map calendar posts to include platform from account
        const mappedCalendar: Record<string, ScheduledPost[]> = {};
        Object.keys(calendarResponse.calendar).forEach(dateKey => {
          mappedCalendar[dateKey] = calendarResponse.calendar[dateKey].map((post: any) => ({
            ...post,
            platform: post.account?.platform || post.platform || "x",
            accountUsername: post.account?.username || post.accountUsername
          }));
        });
        setCalendarView(mappedCalendar);
      } catch (calendarErr) {
        if (!silent) setCalendarView({});
      }

      // Load analytics
      try {
        const analyticsResponse = await apiRequest<{
          analytics: AnalyticsData
        }>("/creator/analytics", {
          accessToken,
          csrfToken
        });
        setAnalytics(analyticsResponse.analytics);
      } catch (analyticsErr) {
        if (!silent) {
          setAnalytics({
            totalFollowers: 0,
            followerGrowth: 0,
            totalEngagement: 0,
            engagementRate: 0,
            totalPosts: 0,
            scheduledPosts: 0,
            topPosts: [],
            dailyStats: []
          });
        }
      }

      // Always load current subscription/plan regardless of other data loading success
      try {
        const subResponse = await apiRequest<{ plan: any }>("/billing/subscription", {
          accessToken,
          csrfToken
        });
        if (subResponse.plan) {
          const newPlan = subResponse.plan.id;
          setTier(newPlan as CreatorTier);
          setCurrentPlan(newPlan);
          // Debug: Notify user of the loaded plan
          if (activeTab === "overview" && !silent) {
             setStatus(`✅ Loaded Plan: ${newPlan} (${(newPlan as string).toUpperCase()})`);
          }
          // Show plan modal on first load if plan is not free
          // if (newPlan !== "free" && !silent) {
          //   setTimeout(() => setShowPlanModal(true), 1000); // Small delay to ensure UI is ready
          // }
        }
      } catch (planErr) {
        console.warn("Failed to load subscription:", planErr);
        // Keep default "free" plan if loading fails
      }

      if (!silent) setLoading(false);
    } catch (err) {
      console.warn("Failed to load data:", err);
      if (!silent) {
        setStatus("Failed to load data");
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (accessToken) {
      loadData(false);
      loadPreferences();
    }
  }, [accessToken, csrfToken]);

  // Polling for real-time updates
  useEffect(() => {
    if (!accessToken) return;

    // Poll every 5 seconds
    const intervalId = setInterval(() => {
      loadData(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [accessToken, csrfToken]);

  // Auto-clear status
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Periodic plan refresh (check for external plan updates every 30 seconds)
  useEffect(() => {
    if (!accessToken) return;

    const planCheckInterval = setInterval(() => {
      loadCurrentPlan();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(planCheckInterval);
  }, [accessToken, csrfToken, currentPlan]);

  // Tier limits
  const getTierLimits = () => {
    switch (tier) {
      case "free":
        return { accounts: 1, analytics: false, templates: 5 };
      case "starter":
      case "basic":
        return { accounts: 3, analytics: true, templates: 20 };
      case "pro":
      case "professional":
      case "enterprise":
        return { accounts: Infinity, analytics: true, templates: Infinity };
      default:
        return { accounts: 1, analytics: false, templates: 5 };
    }
  };

  const canConnectMore = () => {
    const limits = getTierLimits();
    return accounts.length < limits.accounts;
  };

  const canAccessAnalytics = () => {
    return tier === "pro";
  };

  // Handlers
  const handleConnectAccount = async () => {
    if (!canConnectMore()) {
      setStatus("❌ Upgrade your plan to connect more accounts");
      return;
    }

    setConnecting(true);

    try {
      // Call the real OAuth endpoint
      const response = await apiRequest<{
        authUrl: string;
        message: string;
      }>("/creator/connect-account", {
        method: "POST",
        body: {
          platform: connectPlatform,
          redirect: window.location.pathname
        },
        accessToken,
        csrfToken
      });

      setStatus(`🔗 ${response.message}`);

      // Redirect to OAuth provider
      window.location.href = response.authUrl;

    } catch (error) {
      setStatus("❌ Failed to connect account");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      console.log("Disconnecting account:", accountId);
      await apiRequest(`/creator/accounts/${accountId}`, {
        method: "DELETE",
        accessToken,
        csrfToken
      });
      console.log("Account deleted successfully");
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setPosts(prev => prev.filter(p => p.accountId !== accountId));
      setStatus("✅ Account disconnected");
    } catch (err: any) {
      console.error("Failed to disconnect account:", err);
      setStatus(`❌ Failed to disconnect account: ${err.response?.data?.error || err.message || "Unknown error"}`);
      // Don't remove from UI if the request failed
      return;
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      console.log("Syncing account:", accountId);
      const response = await apiRequest(`/creator/accounts/${accountId}/sync`, {
        method: "POST",
        accessToken,
        csrfToken
      });
      console.log("Account synced successfully:", response);

      // Update the account in the local state
      setAccounts(prev => prev.map(account =>
        account.id === accountId ? (response as any).account : account
      ));

      setStatus("✅ Account synced successfully");
    } catch (err: any) {
      console.error("Failed to sync account:", err);

      // Handle rate limit errors specifically
      if (err.response?.status === 429) {
        setStatus(`⏱️ Rate limit reached. Please wait ${Math.ceil((err.response.data?.retryAfter || 900) / 60)} minutes before syncing again.`);
      } else {
        setStatus(`❌ Failed to sync account: ${err.response?.data?.error || err.message || "Unknown error"}`);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.content.trim()) {
      setStatus("❌ Post content is required");
      return;
    }
    if (!postForm.accountId) {
      setStatus("❌ Please select an account");
      return;
    }
    // Only require scheduledFor if not a draft
    if (postForm.status === "scheduled" && !postForm.scheduledFor) {
      setStatus("❌ Please select a schedule time");
      return;
    }

    try {
      setStatus(postForm.status === "draft" ? "🔄 Saving draft..." : "🔄 Scheduling post...");
      const response = await apiRequest<{
        post: ScheduledPost;
        message: string;
      }>("/creator/posts", {
        method: "POST",
        body: {
          accountId: postForm.accountId,
          content: postForm.content,
          scheduledFor: postForm.scheduledFor ? new Date(postForm.scheduledFor).toISOString() : undefined,
          mediaUrls: postForm.mediaUrls,
          status: postForm.status,
          threadItems: postForm.threadItems.length > 0 ? postForm.threadItems : undefined,
        },
        accessToken,
        csrfToken
      });

      setPosts(prev => [response.post, ...prev]);
      setPostForm({ 
        content: "", 
        platform: "x", 
        accountId: "", 
        scheduledFor: "", 
        mediaUrls: [],
        status: "scheduled",
        threadItems: []
      });
      setShowPostModal(false);
      setStatus(`✅ ${response.message || (postForm.status === "draft" ? "Draft saved!" : "Post scheduled!")}`);
      loadData(true);
    } catch (error: any) {
      console.error("Failed to create post:", error);
      setStatus(`❌ Failed to ${postForm.status === "draft" ? "save draft" : "schedule post"}: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      setStatus("🔄 Updating post...");
      const response = await apiRequest<{
        post: ScheduledPost;
        message: string;
      }>(`/creator/posts/${editingPost.id}`, {
        method: "PATCH",
        body: {
          content: postForm.content,
          scheduledFor: new Date(postForm.scheduledFor).toISOString(),
        },
        accessToken,
        csrfToken
      });

      setPosts(prev => prev.map(p => p.id === editingPost.id ? response.post : p));
      setEditingPost(null);
      setShowPostModal(false);
      setStatus(`✅ ${response.message || "Post updated!"}`);
    } catch (error: any) {
      console.error("Failed to update post:", error);
      setStatus(`❌ Failed to update post: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setStatus("🗑️ Deleting post...");
      await apiRequest(`/creator/posts/${postId}`, {
        method: "DELETE",
        accessToken,
        csrfToken
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setStatus("✅ Post deleted");
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      setStatus(`❌ Failed to delete post: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };


  const handleCancelPost = async (postId: string) => {
    try {
      setStatus("🔄 Cancelling post...");
      const response = await apiRequest<{
        post: ScheduledPost;
        message: string;
      }>(`/creator/posts/${postId}`, {
        method: "PATCH",
        body: { status: "cancelled" },
        accessToken,
        csrfToken
      });
      setPosts(prev => prev.map(p => p.id === postId ? response.post : p));
      setStatus("✅ Post cancelled");
    } catch (error: any) {
      console.error("Failed to cancel post:", error);
      setStatus(`❌ Failed to cancel post: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      setStatus("❌ Template name and content are required");
      return;
    }

    try {
      setStatus("🔄 Creating template...");
      const response = await apiRequest<{ template: PostTemplate }>("/creator/templates", {
        method: "POST",
        body: {
          name: templateForm.name,
          content: templateForm.content,
          category: templateForm.category,
          mediaUrls: templateForm.mediaUrls,
          tags: templateForm.tags,
        },
        accessToken,
        csrfToken
      });

      setTemplates(prev => [...prev, response.template]);
      setTemplateForm({ name: "", content: "", category: "General", mediaUrls: [], tags: [] });
      setShowTemplateModal(false);
      setStatus("✅ Template created!");
      loadData(true);
    } catch (error: any) {
      console.error("Failed to create template:", error);
      setStatus(`❌ Failed to create template: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleUseTemplate = (template: PostTemplate) => {
    setPostForm(prev => ({ ...prev, content: template.content }));
    setShowPostModal(true);
    setStatus(`📝 Template "${template.name}" loaded`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await apiRequest(`/creator/templates/${templateId}`, {
        method: "DELETE",
        accessToken,
        csrfToken
      });
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setStatus("✅ Template deleted");
      loadData(true);
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      setStatus(`❌ Failed to delete template: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  // New handlers for all features
  const handleRetryPost = async (postId: string) => {
    try {
      setStatus("🔄 Retrying post...");
      await apiRequest(`/creator/posts/${postId}/retry`, {
        method: "POST",
        accessToken,
        csrfToken
      });
      setStatus("✅ Post queued for retry");
      loadData(true);
    } catch (error: any) {
      console.error("Failed to retry post:", error);
      setStatus(`❌ Failed to retry post: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleSyncEngagement = async (postId: string) => {
    try {
      setStatus("🔄 Syncing engagement...");
      const response = await apiRequest(`/creator/posts/${postId}/sync-engagement`, {
        method: "POST",
        accessToken,
        csrfToken
      });
      setStatus("✅ Engagement synced");
      loadData(true);
    } catch (error: any) {
      console.error("Failed to sync engagement:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      
      // Check if this is an OAuth token issue
      if (errorMessage.includes("reconnect") || errorMessage.includes("reconnected") || 
          errorMessage.includes("unauthorized_client") || errorMessage.includes("Token refresh failed")) {
        setStatus(`⚠️ Account needs reconnection: ${errorMessage}. Please go to Accounts tab and reconnect your social media account.`);
      } else {
        setStatus(`❌ Failed to sync engagement: ${errorMessage}`);
      }
    }
  };

  const handleUploadMedia = async (file: File) => {
    try {
      setUploadingMedia(true);
      // In production, upload to S3/Cloudinary first, then save metadata
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const url = e.target?.result as string;
        const response = await apiRequest<{ id: string; url: string; thumbnailUrl?: string }>("/creator/media/upload", {
          method: "POST",
          body: {
            filename: file.name,
            url: url,
            mimeType: file.type,
            size: file.size,
            tags: []
          },
          accessToken,
          csrfToken
        });
        setMediaLibrary(prev => [...prev, {
          id: response.id,
          filename: file.name,
          url: response.url,
          thumbnailUrl: response.thumbnailUrl,
          mimeType: file.type,
          size: file.size,
          tags: [],
          createdAt: new Date().toISOString()
        }]);
        setPostForm(prev => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, response.url]
        }));
        setStatus("✅ Media uploaded");
        setUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Failed to upload media:", error);
      setStatus(`❌ Failed to upload media: ${error.response?.data?.error || error.message || "Unknown error"}`);
      setUploadingMedia(false);
    }
  };

  const handleGetOptimalTimes = async (accountId: string) => {
    try {
      setStatus("🔄 Calculating optimal times...");
      // First calculate
      await apiRequest(`/creator/accounts/${accountId}/optimal-times/calculate`, {
        method: "POST",
        accessToken,
        csrfToken
      });
      // Then get results
      const response = await apiRequest<{ times: OptimalTime[] }>(`/creator/accounts/${accountId}/optimal-times`, {
        accessToken,
        csrfToken
      });
      setOptimalTimes(response.times);
      setSelectedAccountForOptimal(accountId);
      setStatus("✅ Optimal times calculated");
    } catch (error: any) {
      console.error("Failed to get optimal times:", error);
      setStatus(`❌ Failed to get optimal times: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleExportAnalytics = async (format: "csv" | "pdf") => {
    try {
      setStatus(`🔄 Exporting analytics as ${format.toUpperCase()}...`);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/creator/analytics/export/${format}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-CSRF-Token": csrfToken || ""
          }
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${Date.now()}.${format === "csv" ? "csv" : "html"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setStatus(`✅ Analytics exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error("Failed to export analytics:", error);
      setStatus(`❌ Failed to export analytics: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  };

  const handleGetHashtagSuggestions = async (platform: string, content?: string) => {
    try {
      const response = await apiRequest<{ suggestions: string[] }>(
        `/creator/hashtags/suggestions?platform=${platform}${content ? `&content=${encodeURIComponent(content)}` : ""}`,
        { accessToken, csrfToken }
      );
      return response.suggestions;
    } catch (error: any) {
      console.error("Failed to get hashtag suggestions:", error);
      return [];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, navigate to login since we cleared local state
      navigate("/login");
    }
  };

  // Sidebar tabs
  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "accounts", label: "Accounts", icon: <FiLink2 /> },
    { id: "scheduler", label: "Scheduler", icon: <FiCalendar /> },
    { id: "analytics", label: "Analytics", icon: <FiTrendingUp /> },
    { id: "templates", label: "Templates", icon: <FiFileText /> },
    { id: "billing", label: "Billing", icon: <FiDollarSign /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  // Render sections
  const renderOverview = () => {
    // Filter accounts and posts by selected platform
    const filteredAccounts = selectedPlatform === "all" 
      ? accounts 
      : accounts.filter(a => a.platform === selectedPlatform);
    
    const filteredPosts = selectedPlatform === "all"
      ? posts
      : posts.filter(p => p.platform === selectedPlatform);

    return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-4 md:p-6 text-white">
        <h2 className="text-base md:text-2xl font-bold mb-2">Welcome back, Creator! 👋</h2>
        <p className="text-pink-100 text-xs md:text-base">
          {tier === "free" && "You're on the Free tier. Upgrade to unlock more features!"}
          {tier === "basic" && "You're on the Basic tier. Go Pro for unlimited accounts!"}
          {tier === "pro" && "You're a Pro! Enjoy unlimited access to all features."}
        </p>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "x", "threads", "linkedin", "instagram"].map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              platform === selectedPlatform
                ? "bg-pink-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {platform === "all" ? "All Platforms" : 
             platform === "x" ? "X (Twitter)" :
             platform === "threads" ? "Threads" :
             platform === "linkedin" ? "LinkedIn" :
             "Instagram"}
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Followers */}
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <FiUsers className="w-8 h-8 text-pink-500" />
            <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
              +{analytics?.followerGrowth || 0}%
            </span>
          </div>
          <p className="text-gray-500 text-sm">Total Followers</p>
          <p className="text-2xl font-bold text-gray-900">
            {selectedPlatform === "all" 
              ? (analytics?.totalFollowers?.toLocaleString() || 0)
              : filteredAccounts.reduce((sum, acc) => sum + acc.followersCount, 0).toLocaleString()}
          </p>
        </div>

        {/* Published Posts */}
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-500 text-sm">Published Posts</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPosts.filter(p => p.status === "published").length}</p>
        </div>

        {/* Scheduled Posts */}
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <FiClock className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-500 text-sm">Scheduled Posts</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPosts.filter(p => p.status === "scheduled").length}</p>
        </div>

        {/* Queued Posts */}
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <FiRefreshCw className="w-8 h-8 text-orange-500 animate-spin-slow" />
          </div>
          <p className="text-gray-500 text-sm">Processing</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPosts.filter(p => p.status === "queued").length}</p>
        </div>

        {/* Failed Posts */}
        <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-500 text-sm">Failed Posts</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPosts.filter(p => p.status === "failed").length}</p>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Connected Accounts</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your connected social media accounts</p>
          </div>
          {canConnectMore() && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="btn btn-primary text-xs md:text-sm py-2  flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Connect Account
            </button>
          )}
        </div>
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiLink2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No accounts connected yet</p>
            <p className="text-sm text-gray-500 mb-3">Connect your social media accounts to start scheduling posts</p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="text-pink-500 hover:text-pink-600 font-medium mt-2"
            >
              Connect Your First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAccounts.map(account => (
              <div key={account.id} className="flex items-center gap-4 p-1 md:p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  account.platform === "x" ? "bg-black text-white" :
                  account.platform === "threads" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
                  account.platform === "linkedin" ? "bg-blue-600 text-white" :
                  "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white"
                }`}>
                  {account.platform === "x" ? <FaXTwitter className="w-6 h-6" /> :
                   account.platform === "threads" ? <SiThreads className="w-6 h-6" /> :
                   account.platform === "linkedin" ? <FaLinkedin className="w-6 h-6" /> :
                   <FaInstagram className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">@{account.username}</p>
                  <p className="text-sm text-gray-500">{account.followersCount.toLocaleString()} followers</p>
                  {account.lastSyncedAt && (
                    <p className="text-xs text-gray-400">
                      Last synced: {new Date(account.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncAccount(account.id)}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sync account data"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Connected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Posts */}
      <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Upcoming Posts</h3>
          <button
            onClick={() => setActiveTab("scheduler")}
            className="text-pink-500 hover:text-pink-600 font-medium text-sm"
          >
            View All →
          </button>
        </div>
        {filteredPosts.filter(p => p.status === "scheduled").length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No upcoming posts</p>
            <button
              onClick={() => setShowPostModal(true)}
              className="text-pink-500 hover:text-pink-600 font-medium mt-2"
            >
              Schedule your first post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(filteredPosts || []).filter(p => p.status === "scheduled").slice(0, 3).map(post => (
              <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  post.platform === "x" ? "bg-black text-white" :
                  post.platform === "threads" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
                  post.platform === "linkedin" ? "bg-blue-600 text-white" :
                  "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white"
                }`}>
                  {post.platform === "x" ? <FaXTwitter className="w-5 h-5" /> :
                   post.platform === "threads" ? <SiThreads className="w-5 h-5" /> :
                   post.platform === "linkedin" ? <FaLinkedin className="w-5 h-5" /> :
                   <FaInstagram className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 line-clamp-2">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <FiClock className="w-3 h-3 inline mr-1" />
                    {new Date(post.scheduledFor).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-2xl font-bold text-gray-900">Connected Accounts</h2>
          <p className="text-gray-500 mt-1 text-xs md:text-base">
            {tier === "free" && "Free tier: 1 account"}
            {(tier === "starter" || tier === "basic") && "Starter tier: 3 accounts (X + Threads)"}
            {(tier === "pro" || tier === "professional" || tier === "enterprise") && "Pro tier: Unlimited accounts"}
          </p>
        </div>
        {canConnectMore() && (
          <button
            onClick={() => setShowConnectModal(true)}
            className="btn btn-primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Connect Account
          </button>
        )}
      </div>

      {/* Account Limits */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 text-xs md:text-base">
              {accounts.length} / {getTierLimits().accounts === Infinity ? "∞" : getTierLimits().accounts} accounts used
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {!canConnectMore() && "Upgrade to connect more accounts"}
            </p>
          </div>
          {tier !== "pro" && (
            <button
              onClick={() => setActiveTab("billing")}
              className="text-pink-500 hover:text-pink-600 font-medium text-sm"
            >
              Upgrade →
            </button>
          )}
        </div>
      </div>

      {/* Platform Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* X (Twitter) */}
        <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <FaXTwitter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">X (Twitter)</h3>
              <p className="text-sm text-gray-500">Connect your X accounts</p>
            </div>
          </div>
          
          {accounts.filter(a => a.platform === "x").length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 mb-3">No X accounts connected</p>
              <button
                onClick={() => { setConnectPlatform("x"); setShowConnectModal(true); }}
                className="text-pink-500 hover:text-pink-600 font-medium"
                disabled={!canConnectMore()}
              >
                Connect X Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.filter(a => a.platform === "x").map(account => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">@{account.username}</p>
                      <p className="text-sm text-gray-500">{account.followersCount.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Threads */}
        <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <SiThreads className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Threads</h3>
              <p className="text-sm text-gray-500">Connect your Threads accounts</p>
            </div>
          </div>
          
          {accounts.filter(a => a.platform === "threads").length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 mb-3">No Threads accounts connected</p>
              <button
                onClick={() => { setConnectPlatform("threads"); setShowConnectModal(true); }}
                className="text-pink-500 hover:text-pink-600 font-medium"
                disabled={!canConnectMore()}
              >
                Connect Threads Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.filter(a => a.platform === "threads").map(account => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">@{account.username}</p>
                      <p className="text-sm text-gray-500">{account.followersCount.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduler = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-2xl font-bold text-gray-900">Content Scheduler</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Schedule and manage your posts</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setPostForm({ 
              content: "", 
              platform: "x", 
              accountId: "", 
              scheduledFor: "", 
              mediaUrls: [],
              status: "scheduled",
              threadItems: []
            });
            setShowPostModal(true);
          }}
          className="btn btn-primary"
          disabled={accounts.length === 0}
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {accounts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 md:p-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm md:text-base">Connect an account first to start scheduling posts.</p>
            <button
              onClick={() => setActiveTab("accounts")}
              className="text-yellow-700 hover:text-yellow-800 text-sm md:text-base font-medium ml-auto"
            >
              Connect Account →
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
          {["all", "draft", "scheduled", "queued", "published", "failed", "cancelled"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                filter === selectedFilter
                  ? "bg-pink-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "calendar" : "grid")}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
          >
            {viewMode === "grid" ? <FiGrid className="w-4 h-4" /> : <FiCalendar className="w-4 h-4" />}
            {viewMode === "grid" ? "Calendar" : "Grid"}
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 rounded-lg text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center gap-2"
          >
            <FiFileText className="w-4 h-4" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "x", "threads", "linkedin", "instagram"].map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              platform === selectedPlatform
                ? "bg-pink-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {platform === "all" ? "All Platforms" : 
             platform === "x" ? "X (Twitter)" :
             platform === "threads" ? "Threads" :
             platform === "linkedin" ? "LinkedIn" :
             "Instagram"}
          </button>
        ))}
      </div>

      {/* Filtered Posts Display */}
      {(() => {
        const filteredPosts = posts.filter(p => {
          // Filter by platform first
          const platformMatch = selectedPlatform === "all" || p.platform === selectedPlatform;
          if (!platformMatch) return false;
          
          // Then filter by status
          if (selectedFilter === "all") return true;
          return p.status === selectedFilter;
        });

        if (filteredPosts.length === 0) {
          return (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg shadow-gray-200/50">
              <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {selectedFilter === "all" ? "" : selectedFilter} posts yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first {selectedFilter === "draft" ? "draft" : "scheduled post"}</p>
              <button
                onClick={() => setShowPostModal(true)}
                className="btn btn-primary"
                disabled={accounts.length === 0}
              >
                Create Post
              </button>
            </div>
          );
        }

        // Calendar View
        if (viewMode === "calendar") {
          return (
            <div className="bg-white rounded-xl p-6 shadow-lg shadow-gray-200/50">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dateKey = date.toISOString().split('T')[0];
                  // Use filtered posts instead of calendarView to respect filters
                  const dayPosts = filteredPosts.filter(post => {
                    const postDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.scheduledFor);
                    return postDate.toISOString().split('T')[0] === dateKey;
                  });
                  return (
                    <div
                      key={i}
                      className="min-h-[80px] border border-gray-200 rounded-lg p-2 bg-gray-50"
                    >
                      <div className="text-xs font-medium text-gray-600 mb-1">{date.getDate()}</div>
                      {dayPosts.slice(0, 2).map(post => (
                        <div
                          key={post.id}
                          className={`text-xs p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 ${
                            post.status === "published" ? "bg-green-100 text-green-800" :
                            post.status === "scheduled" || post.status === "queued" ? "bg-blue-100 text-blue-800" :
                            post.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                            post.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-pink-100 text-pink-800"
                          }`}
                          onClick={() => {
                            setPreviewPost(post);
                            setShowPreviewModal(true);
                          }}
                          title={`${post.status} - ${post.content.substring(0, 50)}`}
                        >
                          {post.content.substring(0, 20)}...
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayPosts.length - 2} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // Grid View
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl p-2 md:p-5 shadow-lg shadow-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    post.platform === "x" ? "bg-black text-white" :
                    post.platform === "threads" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
                    post.platform === "linkedin" ? "bg-blue-600 text-white" :
                    "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white"
                  }`}>
                    {post.platform === "x" ? <FaXTwitter className="w-4 h-4" /> :
                     post.platform === "threads" ? <SiThreads className="w-4 h-4" /> :
                     post.platform === "linkedin" ? <FaLinkedin className="w-4 h-4" /> :
                     <FaInstagram className="w-4 h-4" />}
                  </div>
                  <span className={`px-4 py-1 text-xs font-medium rounded-full ${
                    post.status === "scheduled" || post.status === "queued" ? "bg-blue-100 text-blue-700" :
                    post.status === "published" ? "bg-green-100 text-green-700" :
                    post.status === "failed" ? "bg-red-100 text-red-700" :
                    post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {post.status}
                  </span>
                </div>
                
                <p className="text-gray-900 line-clamp-3 mb-3 text-xs md:text-base">{post.content}</p>
                
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    📎 {post.mediaUrls.length} media file{post.mediaUrls.length > 1 ? 's' : ''}
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mb-4">
                  <FiClock className="w-3 h-3 inline mr-1" />
                  {new Date(post.scheduledFor).toLocaleString()}
                </div>

                {(post.engagement || post.performance) && (
                  <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 mb-4 border-t pt-3">
                    <span><FiHeart className="w-3 h-3 inline mr-1" />{post.performance?.likes || post.engagement?.likes || 0}</span>
                    <span><FiMessageCircle className="w-3 h-3 inline mr-1" />{post.performance?.comments || post.engagement?.comments || 0}</span>
                    <span><FiRepeat className="w-3 h-3 inline mr-1" />{post.performance?.reposts || post.engagement?.reposts || 0}</span>
                    {post.performance?.views && (
                      <span><FiEye className="w-3 h-3 inline mr-1" />{post.performance.views}</span>
                    )}
                    {post.performance?.engagementRate !== undefined && (
                      <span className="text-green-600 font-medium">
                        {post.performance.engagementRate.toFixed(1)}% engagement
                      </span>
                    )}
                  </div>
                )}
                {post.threadItems && post.threadItems.length > 0 && (
                  <div className="text-xs text-blue-600 mb-2">
                    🧵 Thread ({post.threadItems.length} posts)
                  </div>
                )}
                {post.errorMessage && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-2">
                    Error: {post.errorMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {post.status === "failed" && (
                    <button
                      onClick={() => handleRetryPost(post.id)}
                      className="flex-1 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <FiRefreshCw className="w-4 h-4 inline mr-1" />
                      Retry
                    </button>
                  )}
                  {(post.status === "scheduled" || post.status === "draft" || post.status === "queued") && (
                    <>
                      <button
                        onClick={() => {
                          setPreviewPost(post);
                          setShowPreviewModal(true);
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Preview post"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setPostForm({
                            content: post.content,
                            platform: post.platform,
                            accountId: post.accountId,
                            scheduledFor: post.scheduledFor,
                            mediaUrls: post.mediaUrls || [],
                            status: post.status as "draft" | "scheduled",
                            threadItems: post.threadItems?.map(item => ({
                              content: item.content,
                              mediaUrls: item.mediaUrls
                            })) || []
                          });
                          setShowPostModal(true);
                        }}
                        className="flex-1 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiEdit3 className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      {post.status === "scheduled" && (
                        <button
                          onClick={() => handleCancelPost(post.id)}
                          className="flex-1 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <FiPause className="w-4 h-4 inline mr-1" />
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                  {post.status === "published" && post.performance && (
                    <button
                      onClick={() => handleSyncEngagement(post.id)}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Sync engagement"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  {post.status === "cancelled" && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex-1 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );

  const renderAnalytics = () => {
    // Filter analytics by selected platform
    const filteredAccounts = selectedPlatform === "all" 
      ? accounts 
      : accounts.filter(a => a.platform === selectedPlatform);
    
    const filteredPosts = selectedPlatform === "all"
      ? posts
      : posts.filter(p => p.platform === selectedPlatform);

    return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Track your performance across platforms</p>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "x", "threads", "linkedin", "instagram"].map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              platform === selectedPlatform
                ? "bg-pink-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {platform === "all" ? "All Platforms" : 
             platform === "x" ? "X (Twitter)" :
             platform === "threads" ? "Threads" :
             platform === "linkedin" ? "LinkedIn" :
             "Instagram"}
          </button>
        ))}
      </div>

      {!canAccessAnalytics() ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg shadow-gray-200/50">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
            <FiTrendingUp className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-2">Unlock Advanced Analytics</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm md:text-base">
            Get detailed insights into your audience, engagement patterns, and content performance with Pro.
          </p>
          <button
            onClick={() => setActiveTab("billing")}
            className="btn btn-primary"
          >
            Upgrade to Pro
          </button>
        </div>
      ) : (
        <>
          {!analytics ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
                  <p className="text-gray-500 text-sm mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.engagementRate?.toFixed(1) || 0}%</p>
                  {analytics.engagementRateChange !== undefined && analytics.engagementRateChange !== 0 && (
                    <p className={`text-sm mt-1 ${analytics.engagementRateChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analytics.engagementRateChange > 0 ? '↑' : '↓'} {Math.abs(analytics.engagementRateChange).toFixed(1)}% from last week
                    </p>
                  )}
                  {(!analytics.engagementRateChange || analytics.engagementRateChange === 0) && (
                    <p className="text-sm text-gray-400 mt-1">No change from last week</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
                  <p className="text-gray-500 text-sm mb-1">Avg. Likes per Post</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round(analytics.avgLikes || 0)}</p>
                  {analytics.likesChange !== undefined && analytics.likesChange !== 0 && (
                    <p className={`text-sm mt-1 ${analytics.likesChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analytics.likesChange > 0 ? '↑' : '↓'} {Math.abs(analytics.likesChange).toFixed(1)}% from last week
                    </p>
                  )}
                  {(!analytics.likesChange || analytics.likesChange === 0) && (
                    <p className="text-sm text-gray-400 mt-1">No change from last week</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
                  <p className="text-gray-500 text-sm mb-1">Avg. Comments per Post</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round(analytics.avgComments || 0)}</p>
                  {analytics.commentsChange !== undefined && analytics.commentsChange !== 0 && (
                    <p className={`text-sm mt-1 ${analytics.commentsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analytics.commentsChange > 0 ? '↑' : '↓'} {Math.abs(analytics.commentsChange).toFixed(1)}% from last week
                    </p>
                  )}
                  {(!analytics.commentsChange || analytics.commentsChange === 0) && (
                    <p className="text-sm text-gray-400 mt-1">No change from last week</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
                  <p className="text-gray-500 text-sm mb-1">Best Posting Time</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.bestPostingTime || "N/A"}</p>
                  <p className="text-sm text-gray-400 mt-1">Based on performance</p>
                </div>
              </div>

              {/* Follower Growth Chart */}
              <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-4">Follower Growth (7 Days)</h3>
                {(!analytics?.dailyStats || analytics.dailyStats.length === 0) ? (
                  <div className="text-center text-gray-500 py-12">
                    <FiTrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No follower data available</p>
                    <p className="text-xs text-gray-400 mt-1">Connect accounts and sync to see growth over time</p>
                  </div>
                ) : (
                  <div className="h-64 flex items-end gap-2">
                    {(() => {
                      const stats = analytics.dailyStats || [];
                      const maxFollowers = Math.max(...stats.map(d => d.followers || 0), 1);
                      const minFollowers = Math.min(...stats.map(d => d.followers || 0), maxFollowers);
                      const range = maxFollowers - minFollowers || 1;
                      
                      return stats.map((day, i) => {
                        const followerCount = day.followers || 0;
                        // Calculate height as percentage of range, with minimum 10% for visibility
                        const heightPercent = range > 0 
                          ? Math.max(10, ((followerCount - minFollowers) / range) * 90 + 10)
                          : 50; // If all values are same, show 50% height
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center min-w-0">
                            <div
                              className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-lg transition-all hover:from-pink-600 hover:to-rose-500 cursor-pointer"
                              style={{ 
                                height: `${heightPercent}%`,
                                minHeight: '20px'
                              }}
                              title={`${followerCount.toLocaleString()} followers on ${new Date(day.date).toLocaleDateString()}`}
                            />
                            <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                              {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                            </span>
                            <span className="text-xs text-gray-400 mt-1 font-medium">
                              {followerCount.toLocaleString()}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Top Performing Posts */}
              <div className="bg-white rounded-xl p-2 md:p-6 shadow-lg shadow-gray-200/50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
                {(!analytics?.topPosts || analytics.topPosts.length === 0) ? (
                  <p className="text-gray-500 text-center py-8">No published posts with performance data yet</p>
                ) : (
                  <div className="space-y-4">
                    {(analytics.topPosts || [])
                      .filter(post => selectedPlatform === "all" || post.platform === selectedPlatform)
                      .map(post => (
                      <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-gray-900 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                            <span><FiEye className="w-3 h-3 inline mr-1" />{post.engagement?.views || post.performance?.views || 0} views</span>
                            <span><FiHeart className="w-3 h-3 inline mr-1" />{post.engagement?.likes || post.performance?.likes || 0}</span>
                            <span><FiMessageCircle className="w-3 h-3 inline mr-1" />{post.engagement?.comments || post.performance?.comments || 0}</span>
                            <span><FiRepeat className="w-3 h-3 inline mr-1" />{post.engagement?.reposts || post.performance?.reposts || 0}</span>
                            {((post.engagement?.views || post.performance?.views || 0) > 0) && (
                              <span className="text-green-600 font-medium">
                                {((post.engagement?.likes || post.performance?.likes || 0) + 
                                 (post.engagement?.comments || post.performance?.comments || 0) + 
                                 (post.engagement?.reposts || post.performance?.reposts || 0))} / {post.engagement?.views || post.performance?.views || 0} = 
                                {((((post.engagement?.likes || post.performance?.likes || 0) + 
                                    (post.engagement?.comments || post.performance?.comments || 0) + 
                                    (post.engagement?.reposts || post.performance?.reposts || 0)) / 
                                   (post.engagement?.views || post.performance?.views || 1)) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
    );
  };

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-2xl font-bold text-gray-900">Post Templates</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Save and reuse your best-performing content formats</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setTemplateForm({ name: "", content: "", category: "General" });
            setShowTemplateModal(true);
          }}
          className="btn btn-primary text-xs"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Template Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "General", "Engagement", "Threads", "Promotional"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedTemplateCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              cat === selectedTemplateCategory
                ? "bg-pink-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {(() => {
        const filteredTemplates = selectedTemplateCategory === "All" 
          ? templates 
          : templates.filter(t => t.category === selectedTemplateCategory);
        
        if (filteredTemplates.length === 0) {
          return (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg shadow-gray-200/50">
              <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedTemplateCategory === "All" ? "No templates yet" : `No ${selectedTemplateCategory} templates`}
              </h3>
              <p className="text-gray-500 mb-4">Create templates to speed up your content creation</p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn btn-primary"
              >
                Create Template
              </button>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl p-5 shadow-lg shadow-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {template.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-4 mb-4 whitespace-pre-wrap">{template.content}</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 py-2 text-sm text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors font-medium"
                >
                  Use Template
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(template.content);
                    setStatus("📋 Copied to clipboard!");
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );

  const renderBilling = () => (
    <BillingPlans
      role="creator"
      currentPlan={currentPlan}
      onPlanChange={(planId) => {
        setCurrentPlan(planId);
        setTier(planId as CreatorTier);
        setStatus(`✅ Successfully upgraded to ${planId} plan!`);
        // Show plan modal after successful upgrade
        setTimeout(() => setShowPlanModal(true), 500);
      }}
      onPlanUpdated={() => {
        // Refresh the current plan data from the server
        loadCurrentPlan();
      }}
    />
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-base md:text-2xl font-bold text-gray-900">
          Settings
        </h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Manage your account preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 divide-y divide-gray-100">
        {/* Profile */}
        <div className="p-2 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="input"
                defaultValue={user?.orgName || ""}
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input bg-gray-50"
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-2 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 text-sm md:text-base">
                Email notifications for scheduled posts
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={preferences.emailScheduledPosts}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailScheduledPosts: e.target.checked,
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 text-sm md:text-base">
                Weekly performance digest
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={preferences.emailWeeklyDigest}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailWeeklyDigest: e.target.checked,
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 text-sm md:text-base">
                Post failure alerts
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={preferences.emailPostFailures}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailPostFailures: e.target.checked,
                  }))
                }
              />
            </label>
          </div>
        </div>

        {/* Timezone */}
        <div className="p-2 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone</h3>
          <select
            className="input max-w-md"
            value={preferences.timezone}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, timezone: e.target.value }))
            }
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="p-6 bg-gray-50/70 border-t border-gray-200/50">
          <button
            onClick={savePreferences}
            disabled={preferencesLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {preferencesLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* Account Type */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Type
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <p className="text-gray-600 capitalize">{role || "Unknown"}</p>
            </div>
            {role !== "creator" && (
              <div>
                <p className="text-gray-600 mb-3">
                  You're viewing the creator dashboard but your account is set
                  to <strong>{role}</strong>. To see creator-specific billing
                  plans, change your role to "Creator".
                </p>
                <button
                  onClick={async () => {
                    try {
                      await updateRole("creator");
                      setStatus("✅ Role updated to Creator! Refreshing...");
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                      setStatus("❌ Failed to update role");
                    }
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Switch to Creator Role
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Danger Zone
          </h3>
          <p className="text-gray-500 mb-4">These actions cannot be undone.</p>
          <div className="flex gap-4">
            <button className="px-2 md:px-4 py-2 text-sm md:text-base text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors">
              Disconnect All Accounts
            </button>
            <button className="px-2 md:px-4 py-2 text-sm md:text-base text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/60 to-fuchsia-50">
      <CreatorNav
        userEmail={user?.email}
        orgName={user?.orgName}
        orgId={user?.orgId}
        currentPlan={currentPlan}
      />

      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <main
        className="pt-20 pb-8 transition-all duration-300"
        style={{
          marginLeft: isCollapsed ? (isSmall ? "40px" : "80px") : "288px",
          paddingRight: "24px",
          paddingLeft: "24px",
        }}
      >
        {/* Status Message */}
        {status && (
          <div
            className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-lg ${
              status.startsWith("✅") ||
              status.startsWith("📝") ||
              status.startsWith("📋") ||
              status.startsWith("🔗")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "accounts" && renderAccounts()}
            {activeTab === "scheduler" && renderScheduler()}
            {activeTab === "analytics" && renderAnalytics()}
            {activeTab === "templates" && renderTemplates()}
            {activeTab === "billing" && renderBilling()}
            {activeTab === "settings" && renderSettings()}
          </>
        )}
      </main>

      {/* Connect Account Modal */}
      <Modal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Social Account"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>OAuth Required:</strong> You'll be redirected to{" "}
              {connectPlatform === "x" ? "X (Twitter)" : 
               connectPlatform === "threads" ? "Threads" :
               connectPlatform === "linkedin" ? "LinkedIn" :
               "Instagram"} to authorize
              DEBBY to access your account.
            </p>
          </div>

          <p className="text-gray-600">Choose a platform to connect:</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConnectPlatform("x")}
              className={`p-4 rounded-xl border-2 transition-all ${
                connectPlatform === "x"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-black flex items-center justify-center">
                <FaXTwitter className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900">X (Twitter)</p>
            </button>

            <button
              onClick={() => setConnectPlatform("threads")}
              className={`p-4 rounded-xl border-2 transition-all ${
                connectPlatform === "threads"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <SiThreads className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900">Threads</p>
            </button>

            <button
              onClick={() => setConnectPlatform("linkedin")}
              className={`p-4 rounded-xl border-2 transition-all ${
                connectPlatform === "linkedin"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-600 flex items-center justify-center">
                <FaLinkedin className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900">LinkedIn</p>
            </button>

            <button
              onClick={() => setConnectPlatform("instagram")}
              className={`p-4 rounded-xl border-2 transition-all ${
                connectPlatform === "instagram"
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                <FaInstagram className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900">Instagram</p>
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowConnectModal(false)}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnectAccount}
              disabled={connecting}
              className="flex-1 py-3 px-4 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting
                ? "Redirecting..."
                : `Connect ${connectPlatform === "x" ? "X" : "Threads"} Account`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Post Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setEditingPost(null);
          setPostForm({
            content: "",
            platform: "x",
            accountId: "",
            scheduledFor: "",
            mediaUrls: [],
            status: "scheduled",
            threadItems: []
          });
        }}
        title={editingPost ? "Edit Post" : "Create New Post"}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Post Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setPostForm(prev => ({ ...prev, status: "scheduled" }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                postForm.status === "scheduled"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setPostForm(prev => ({ ...prev, status: "draft" }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                postForm.status === "draft"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Save as Draft
            </button>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {accounts.filter((a) => a.platform === "x").length > 0 && (
                <button
                  onClick={() =>
                    setPostForm((prev) => ({
                      ...prev,
                      platform: "x",
                      accountId:
                        accounts.find((a) => a.platform === "x")?.id || "",
                    }))
                  }
                  className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                    postForm.platform === "x"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200"
                  }`}
                >
                  <FaXTwitter className="w-4 h-4" />
                  <span>X</span>
                </button>
              )}
              {accounts.filter((a) => a.platform === "threads").length > 0 && (
                <button
                  onClick={() =>
                    setPostForm((prev) => ({
                      ...prev,
                      platform: "threads",
                      accountId:
                        accounts.find((a) => a.platform === "threads")?.id ||
                        "",
                    }))
                  }
                  className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                    postForm.platform === "threads"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200"
                  }`}
                >
                  <SiThreads className="w-4 h-4" />
                  <span>Threads</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account
            </label>
            <select
              value={postForm.accountId}
              onChange={(e) => {
                setPostForm((prev) => ({ ...prev, accountId: e.target.value }));
                if (e.target.value) {
                  handleGetOptimalTimes(e.target.value);
                }
              }}
              className="input"
            >
              <option value="">Select an account</option>
              {accounts
                .filter((a) => a.platform === postForm.platform)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username}
                  </option>
                ))}
            </select>
          </div>

          {/* Optimal Time Suggestion */}
          {postForm.accountId && optimalTimes.length > 0 && postForm.status === "scheduled" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Optimal Posting Times</p>
              <div className="flex flex-wrap gap-2">
                {optimalTimes.slice(0, 3).map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const now = new Date();
                      const suggestedDate = new Date(now);
                      suggestedDate.setDate(now.getDate() + (time.dayOfWeek - now.getDay() + 7) % 7);
                      suggestedDate.setHours(time.hour, 0, 0, 0);
                      setPostForm(prev => ({
                        ...prev,
                        scheduledFor: suggestedDate.toISOString().slice(0, 16)
                      }));
                    }}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full text-blue-700 hover:bg-blue-100"
                  >
                    {time.dayName} {time.timeString}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (postForm.accountId && postForm.content) {
                      const suggestions = await handleGetHashtagSuggestions(
                        postForm.platform,
                        postForm.content
                      );
                      if (suggestions.length > 0) {
                        const currentHashtags = postForm.content.match(/#\w+/g) || [];
                        const newHashtags = suggestions.filter(s => 
                          !currentHashtags.includes(s)
                        ).slice(0, 3);
                        if (newHashtags.length > 0) {
                          setPostForm(prev => ({
                            ...prev,
                            content: prev.content + " " + newHashtags.join(" ")
                          }));
                          setStatus("✅ Hashtag suggestions added");
                        }
                      }
                    }
                  }}
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  title="Get hashtag suggestions"
                >
                  # Hashtags
                </button>
                <button
                  onClick={() => {
                    setPreviewPost({
                      id: "preview",
                      content: postForm.content,
                      platform: postForm.platform,
                      accountId: postForm.accountId,
                      scheduledFor: postForm.scheduledFor || new Date().toISOString(),
                      status: postForm.status,
                      mediaUrls: postForm.mediaUrls,
                      threadItems: postForm.threadItems,
                      createdAt: new Date().toISOString()
                    });
                    setShowPreviewModal(true);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  title="Preview post"
                >
                  👁️ Preview
                </button>
              </div>
            </div>
            <textarea
              value={postForm.content}
              onChange={(e) =>
                setPostForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className="input min-h-[120px] resize-none"
              placeholder="What's on your mind?"
              maxLength={postForm.platform === "x" ? 280 : 500}
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {postForm.content.length} /{" "}
              {postForm.platform === "x" ? 280 : 500}
            </p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Files
            </label>
            <div className="flex gap-2 mb-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleUploadMedia(file));
                  }}
                />
                <div className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors text-center text-sm text-gray-600">
                  {uploadingMedia ? "Uploading..." : "📎 Upload Media"}
                </div>
              </label>
              <button
                onClick={() => setShowMediaModal(true)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors text-sm text-gray-600"
              >
                📚 Media Library
              </button>
            </div>
            {postForm.mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postForm.mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Media ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => setPostForm(prev => ({
                        ...prev,
                        mediaUrls: prev.mediaUrls.filter((_, i) => i !== idx)
                      }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thread Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Thread Posts (Optional)
              </label>
              <button
                onClick={() => setShowThreadBuilder(!showThreadBuilder)}
                className="text-xs text-pink-600 hover:text-pink-700"
              >
                {showThreadBuilder ? "Hide" : "Add Thread Posts"}
              </button>
            </div>
            {showThreadBuilder && (
              <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                {postForm.threadItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Post {idx + 2}</span>
                      <button
                        onClick={() => setPostForm(prev => ({
                          ...prev,
                          threadItems: prev.threadItems.filter((_, i) => i !== idx)
                        }))}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={item.content}
                      onChange={(e) => {
                        const newItems = [...postForm.threadItems];
                        newItems[idx].content = e.target.value;
                        setPostForm(prev => ({ ...prev, threadItems: newItems }));
                      }}
                      className="input text-sm min-h-[60px]"
                      placeholder="Thread post content..."
                      maxLength={postForm.platform === "x" ? 280 : 500}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setPostForm(prev => ({
                    ...prev,
                    threadItems: [...prev.threadItems, { content: "", mediaUrls: [] }]
                  }))}
                  className="w-full py-2 text-sm text-pink-600 hover:text-pink-700 border border-pink-300 rounded-lg hover:bg-pink-50"
                >
                  + Add Thread Post
                </button>
              </div>
            )}
          </div>

          {/* Schedule Time */}
          {postForm.status === "scheduled" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For
              </label>
              <input
                type="datetime-local"
                value={postForm.scheduledFor}
                onChange={(e) =>
                  setPostForm((prev) => ({
                    ...prev,
                    scheduledFor: e.target.value,
                  }))
                }
                className="input"
                style={{ colorScheme: "light" }}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowPostModal(false);
                setEditingPost(null);
                setPostForm({
                  content: "",
                  platform: "x",
                  accountId: "",
                  scheduledFor: "",
                  mediaUrls: [],
                  status: "scheduled",
                  threadItems: []
                });
              }}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingPost ? handleUpdatePost : handleCreatePost}
              className="flex-1 py-3 px-4 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors"
            >
              {editingPost 
                ? (postForm.status === "draft" ? "Update Draft" : "Update Post")
                : (postForm.status === "draft" ? "Save Draft" : "Schedule Post")
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        title="Create Template"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) =>
                setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input"
              placeholder="e.g., Weekly Update"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={templateForm.category}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="input"
            >
              <option value="General">General</option>
              <option value="Engagement">Engagement</option>
              <option value="Threads">Threads</option>
              <option value="Promotional">Promotional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={templateForm.content}
              onChange={(e) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              className="input min-h-[150px] resize-none"
              placeholder="Template content with [placeholders]..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowTemplateModal(false);
                setEditingTemplate(null);
              }}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTemplate}
              className="flex-1 py-3 px-4 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors"
            >
              Create Template
            </button>
          </div>
        </div>
      </Modal>

      {/* Media Library Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title="Media Library"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <label className="flex-1 cursor-pointer block">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleUploadMedia(file));
              }}
            />
            <div className="w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors text-center">
              {uploadingMedia ? "Uploading..." : "📎 Click to Upload Media"}
            </div>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {mediaLibrary.map(media => (
              <div key={media.id} className="relative group">
                <img src={media.thumbnailUrl || media.url} alt={media.filename} className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setPostForm(prev => ({
                      ...prev,
                      mediaUrls: [...prev.mediaUrls, media.url]
                    }));
                    setShowMediaModal(false);
                  }}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs">Select</span>
                </button>
              </div>
            ))}
          </div>
          {mediaLibrary.length === 0 && (
            <p className="text-center text-gray-500 py-8">No media files yet. Upload some to get started!</p>
          )}
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Import Posts"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>CSV Format:</strong> accountId, content, scheduledFor, mediaUrls (semicolon-separated)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste CSV Data
            </label>
            <textarea
              id="csvInput"
              className="input min-h-[200px] font-mono text-xs"
              placeholder="accountId,content,scheduledFor,mediaUrls&#10;acc_123,Hello world,2024-01-30T10:00:00Z,url1;url2"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(false)}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const csvData = (document.getElementById("csvInput") as HTMLTextAreaElement)?.value;
                if (!csvData.trim()) {
                  setStatus("❌ Please paste CSV data");
                  return;
                }
                try {
                  setStatus("🔄 Importing posts...");
                  const result = await apiRequest<{ created: number; failed: number; errors: string[] }>(
                    "/creator/posts/import-csv",
                    {
                      method: "POST",
                      body: { csvData },
                      accessToken,
                      csrfToken
                    }
                  );
                  setStatus(`✅ Imported ${result.created} posts${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
                  setShowBulkModal(false);
                  loadData(true);
                } catch (error: any) {
                  setStatus(`❌ Failed to import: ${error.response?.data?.error || error.message}`);
                }
              }}
              className="flex-1 py-3 px-4 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors"
            >
              Import Posts
            </button>
          </div>
        </div>
      </Modal>

      {/* Post Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Post Preview"
      >
        {previewPost && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              previewPost.platform === "x" ? "bg-black text-white" :
              previewPost.platform === "threads" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" :
              previewPost.platform === "linkedin" ? "bg-blue-600 text-white" :
              "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {previewPost.platform === "x" ? <FaXTwitter className="w-5 h-5" /> :
                   previewPost.platform === "threads" ? <SiThreads className="w-5 h-5" /> :
                   previewPost.platform === "linkedin" ? <FaLinkedin className="w-5 h-5" /> :
                   <FaInstagram className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold">@{previewPost.accountUsername || "username"}</p>
                  <p className="text-xs opacity-80">{new Date(previewPost.scheduledFor).toLocaleString()}</p>
                </div>
              </div>
              <p className="whitespace-pre-wrap mb-3">{previewPost.content}</p>
              {previewPost.mediaUrls && previewPost.mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {previewPost.mediaUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Media ${idx + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              )}
              {previewPost.threadItems && previewPost.threadItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs opacity-80 mb-2">Thread ({previewPost.threadItems.length} posts):</p>
                  {previewPost.threadItems.map((item, idx) => (
                    <div key={idx} className="mb-2 opacity-90">
                      <p className="text-xs">{idx + 2}/</p>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Global Search */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(result) => {
          // Map search result type to dashboard sections
          if (result.type === "template") setActiveTab("templates");
          setIsSearchOpen(false);
        }}
        role="business"
      />

      {/* Help Center */}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Current Plan Modal */}
      <CurrentPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={currentPlan}
        plans={availablePlans}
        role="creator"
      />

      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding
          role="creator"
          onComplete={() => setShowOnboarding(false)}
          onNavigate={(tab) => {
            if (tab === "accounts") setActiveTab("accounts");
            if (tab === "scheduler") setActiveTab("scheduler");
            if (tab === "templates") setActiveTab("templates");
            if (tab === "analytics") setActiveTab("analytics");
          }}
        />
      )}
    </div>
  );
};
