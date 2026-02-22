import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import { 
  FiLink2, 
  FiZap, 
  FiLock, 
  FiBarChart2, 
  FiTrendingUp, 
  FiUsers,
  FiArrowRight,
  FiCode,
  FiBriefcase,
  FiShield,
  FiCheck,
  FiCreditCard,
  FiMessageSquare,
  FiMail,
  FiGithub,
  FiDollarSign,
  FiGlobe,
  FiActivity,
  FiSettings,
  FiPhone,
  FiMessageCircle,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiClock,
  FiAward,
  FiServer,
  FiDatabase,
  FiKey,
  FiSend,
  FiRepeat,
  FiEye,
  FiAlertCircle,
  FiShoppingBag,
  FiTwitter,
  FiAtSign,
  FiCalendar,
  FiImage,
  FiPieChart,
  FiTarget,
  FiEdit3,
  FiShare2,
  FiHash,
  FiMenu,
  FiX
} from "react-icons/fi";
import { Navbar } from "../components/Navbar";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { LazyImage } from "../components/LazyImage";
import { ChatWidget } from "../components/ChatWidget";
import { ToastContainer, toast, Toast } from "../components/Toast";
import { CookieConsent } from "../components/CookieConsent";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { Skeleton } from "../components/SkeletonLoader";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { analytics } from "../utils/analytics";
import { performanceMonitor } from "../utils/performance";
import { abTesting } from "../utils/abTesting";

export const Home = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: "", role: "", content: "", rating: 5 });
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    // Show hero section immediately
    setVisibleSections((prev) => new Set(prev).add("main-content"));
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const sections = document.querySelectorAll("[data-animate]");
      sections.forEach((section) => {
        const id = section.id || section.getAttribute("id");
        if (id && id !== "main-content") {
          observer.observe(section);
        }
      });
    }, 100);

    return () => {
      const sections = document.querySelectorAll("[data-animate]");
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Initialize performance monitoring and analytics
  useEffect(() => {
    performanceMonitor.measurePageLoad();
    performanceMonitor.monitorWebVitals();
    analytics.trackPageView(window.location.pathname);
    
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Subscribe to toast notifications
  useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts: Toast[]) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  // A/B Testing for CTA button
  const ctaVariant = abTesting.getVariant("cta_button", ["default", "highlighted"]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!testimonialForm.name.trim()) {
      errors.name = "Name is required";
    }
    if (!testimonialForm.role.trim()) {
      errors.role = "Role is required";
    }
    if (!testimonialForm.content.trim()) {
      errors.content = "Testimonial is required";
    } else if (testimonialForm.content.trim().length < 20) {
      errors.content = "Testimonial must be at least 20 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const stats = [
    { value: "10,000+", label: "Active Users", icon: <FiUsers className="w-6 h-6" /> },
    { value: "50M+", label: "Events Processed", icon: <FiActivity className="w-6 h-6" /> },
    { value: "99.9%", label: "Uptime SLA", icon: <FiServer className="w-6 h-6" /> },
    { value: "<100ms", label: "Average Latency", icon: <FiZap className="w-6 h-6" /> }
  ];

  const developerFeatures = [
    {
      icon: <FiKey />,
      title: "API Keys Management",
      description: "Generate and manage API keys with environment-based access control (development, staging, production). Track usage patterns, monitor performance metrics, and implement rate limiting. Full audit trail of all API key activities.",
      details: [
        "Environment-based key management",
        "Usage analytics and monitoring",
        "Automatic rotation support",
        "IP whitelisting capabilities"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FiZap />,
      title: "Webhook Automation",
      description: "Create powerful webhooks with intelligent retry logic, HMAC signature verification, and comprehensive delivery tracking. Monitor webhook health, set custom retry policies, and receive real-time delivery status updates.",
      details: [
        "Configurable retry policies",
        "HMAC signature verification",
        "Delivery attempt history",
        "Webhook health monitoring"
      ],
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: <FiGithub />,
      title: "GitHub Integration",
      description: "Seamlessly connect with GitHub for repository events, pull requests, issues, and deployment automation. Trigger webhooks on code pushes, PR merges, and release events. Full GitHub webhook event support.",
      details: [
        "Repository event webhooks",
        "PR and issue tracking",
        "Deployment automation",
        "Commit status updates"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <FiBarChart2 />,
      title: "Real-time Analytics",
      description: "Monitor your automations with detailed metrics, delivery history, and performance insights. Track success rates, response times, error patterns, and usage trends. Export data for custom reporting.",
      details: [
        "Real-time dashboards",
        "Custom date range filtering",
        "Export capabilities",
        "Performance benchmarking"
      ],
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <FiActivity />,
      title: "Event Logging",
      description: "Comprehensive event logs with delivery attempts, HTTP status codes, response bodies, and error tracking. Search and filter events by type, status, date range, and webhook endpoint.",
      details: [
        "Complete event history",
        "Advanced search and filters",
        "Response body inspection",
        "Error message details"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiSettings />,
      title: "Developer Tools",
      description: "Built-in webhook playground for testing, comprehensive API documentation with code examples, and testing tools. Test webhooks before deployment, validate payloads, and debug issues.",
      details: [
        "Interactive webhook playground",
        "API documentation",
        "Payload validation",
        "Debugging utilities"
      ],
      gradient: "from-rose-500 to-red-500"
    }
  ];

  const businessFeatures = [
    {
      icon: <FiCreditCard />,
      title: "Payment Infrastructure",
      description: "Run checkout with Stripe or Paystack, generate payment links instantly, and keep payment lifecycle states synchronized from webhook to dashboard revenue.",
      details: [
        "Stripe & Paystack checkout routing",
        "Automatic payment link generation",
        "Webhook-confirmed payment state sync",
        "Multi-currency payment support"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiUsers />,
      title: "Storefront & Catalog",
      description: "Launch branded storefronts with shop-specific categories, rich product variants, and media uploads. Manage inventory, pricing, and product publishing from one place.",
      details: [
        "Multi-shop storefront management",
        "Category templates by shop type",
        "Variants: size, color, texture, length",
        "Image and product media uploads"
      ],
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <FiMail />,
      title: "Order Fulfillment",
      description: "Capture structured checkout data, track order states end-to-end, and let customers view updates clearly from storefront order tracking.",
      details: [
        "Cart checkout with tracked order records",
        "Order states: pending, paid, in-transit, delivered",
        "Shop owner order management dashboard",
        "Customer order tracking by verified details"
      ],
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: <FiMessageSquare />,
      title: "Customer Operations",
      description: "Build clean, shop-scoped customer records from checkout and manual entries without duplicates, then manage communication history and notes in one workspace.",
      details: [
        "Shop-specific customer records",
        "Duplicate prevention by email/phone",
        "Communication history timelines",
        "Customer notes and segmentation tools"
      ],
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: <FiRepeat />,
      title: "Messaging & Automation",
      description: "Trigger operational messages across channels and keep teams informed with reliable delivery and fallback support for business-critical notifications.",
      details: [
        "Email, SMS, and WhatsApp channels",
        "Business event-driven notification flows",
        "Delivery status and retry visibility",
        "Automated customer communication touchpoints"
      ],
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: <FiTrendingUp />,
      title: "Revenue Intelligence",
      description: "Track operational and financial performance with actionable dashboards, payment analytics, and forecasting signals designed for growing business teams.",
      details: [
        "Real-time revenue and payment analytics",
        "Forecast and performance monitoring",
        "Operational status dashboards",
        "Business reporting visibility"
      ],
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const creatorFeatures = [
    {
      icon: <FiTwitter />,
      title: "X (Twitter) Integration",
      description: "Connect your X account to schedule posts, track engagement metrics, and automate content publishing. Monitor followers, likes, retweets, and impressions in real-time. AI-powered best time to post suggestions.",
      details: [
        "Scheduled posts with images & text",
        "Engagement analytics",
        "Follower growth tracking",
        "Best time to post insights"
      ],
      gradient: "from-gray-800 to-black"
    },
    {
      icon: <FiAtSign />,
      title: "Threads Integration",
      description: "Link your Threads account and automate your content strategy. Schedule threads, track engagement, and grow your audience with data-driven insights. Cross-post content seamlessly between platforms.",
      details: [
        "Scheduled thread posts",
        "Engagement metrics",
        "Audience insights",
        "Cross-platform posting"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <FiCalendar />,
      title: "Content Scheduler",
      description: "Plan and schedule your content weeks in advance with our visual calendar. Queue posts, set optimal posting times, and maintain consistent presence across all linked accounts.",
      details: [
        "Visual content calendar",
        "Queue management",
        "Bulk scheduling",
        "Timezone optimization"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FiPieChart />,
      title: "Advanced Analytics",
      description: "Deep dive into your social media performance with comprehensive analytics. Track follower growth, engagement rates, reach, impressions, and content performance over time.",
      details: [
        "Performance dashboards",
        "Engagement tracking",
        "Growth analytics",
        "Export reports"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <FiTarget />,
      title: "Audience Insights",
      description: "Understand your audience better with demographic data, active hours, and content preferences. Optimize your posting strategy based on when your followers are most active.",
      details: [
        "Demographic breakdown",
        "Active hours analysis",
        "Content performance",
        "Competitor benchmarking"
      ],
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <FiEdit3 />,
      title: "Content Templates",
      description: "Create and save post templates for consistent branding. Use AI-powered suggestions to improve engagement and maintain your unique voice across all platforms.",
      details: [
        "Reusable templates",
        "AI content suggestions",
        "Brand voice consistency",
        "Hashtag recommendations"
      ],
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const securityFeatures = [
    { feature: "Bank-level encryption (AES-256)", icon: <FiLock /> },
    { feature: "Role-based access control (RBAC)", icon: <FiShield /> },
    { feature: "Comprehensive audit logs", icon: <FiEye /> },
    { feature: "CSRF protection", icon: <FiShield /> },
    { feature: "Rate limiting & DDoS protection", icon: <FiAlertCircle /> },
    { feature: "Secure API key storage", icon: <FiKey /> },
    { feature: "Webhook signature verification", icon: <FiCheck /> },
    { feature: "SOC 2 compliant infrastructure", icon: <FiAward /> }
  ];

  const integrations = [
    { name: "Stripe", icon: <FiCreditCard className="w-6 h-6" />, color: "from-indigo-500 to-purple-500" },
    { name: "Paystack", icon: <FiDollarSign className="w-6 h-6" />, color: "from-green-500 to-emerald-500" },
    { name: "GitHub", icon: <FiGithub className="w-6 h-6" />, color: "from-gray-700 to-gray-900" },
    { name: "SendGrid", icon: <FiMail className="w-6 h-6" />, color: "from-blue-500 to-cyan-500" },
    { name: "Twilio", icon: <FiPhone className="w-6 h-6" />, color: "from-red-500 to-pink-500" },
    { name: "WhatsApp", icon: <FiMessageCircle className="w-6 h-6" />, color: "from-green-400 to-green-600" },
    { name: "X (Twitter)", icon: <FiTwitter className="w-6 h-6" />, color: "from-gray-800 to-black" },
    { name: "Threads", icon: <FiAtSign className="w-6 h-6" />, color: "from-purple-500 to-pink-500" }
  ];

  const useCases = [
    {
      title: "E-commerce Automation",
      description: "Automate order processing, payment collection, and customer notifications. Send order confirmations via email, SMS, and WhatsApp with automatic fallback.",
      icon: <FiShoppingBag />,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "SaaS Subscription Management",
      description: "Handle recurring billing, manage subscriptions, and process payments automatically. Send renewal reminders and handle failed payments with retry logic.",
      icon: <FiRepeat />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Developer Workflows",
      description: "Automate CI/CD pipelines, trigger deployments on GitHub events, and monitor webhook deliveries. Integrate with your development tools seamlessly.",
      icon: <FiCode />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Content Creator Growth",
      description: "Schedule posts across X and Threads, track engagement metrics, and grow your audience with data-driven insights. Automate content publishing and analyze performance.",
      icon: <FiShare2 />,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Customer Communication",
      description: "Send transactional notifications, marketing campaigns, and automated follow-ups across email, SMS, and WhatsApp channels.",
      icon: <FiSend />,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechStart",
      content: "DEBBY has transformed how we handle webhooks and API integrations. The retry logic and monitoring features saved us countless hours of debugging.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Founder, PayFlow",
      content: "As a payment processing company, DEBBY's Stripe and Paystack integrations are flawless. The automatic payment link generation is a game-changer.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Lead Developer, CloudScale",
      content: "The webhook playground and comprehensive analytics helped us optimize our automation workflows. Best developer experience we've had.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Product Manager, InnovateCo",
      content: "The customer management features are incredible. We've streamlined our entire sales process and improved customer relationships significantly.",
      rating: 5
    },
    {
      name: "James Thompson",
      role: "Founder, SaaSFlow",
      content: "Recurring payments setup was so easy. The automatic card charging feature eliminated our payment collection headaches completely.",
      rating: 5
    },
    {
      name: "Lisa Anderson",
      role: "Operations Director, GrowthHub",
      content: "Multi-channel notifications with automatic fallback saved us during critical customer communications. Email to SMS to WhatsApp works flawlessly.",
      rating: 5
    },
    {
      name: "Robert Martinez",
      role: "Senior Developer, CodeCraft",
      content: "The API documentation is comprehensive and the webhook testing tools are exactly what we needed. Integration took less than an hour.",
      rating: 5
    },
    {
      name: "Jennifer Lee",
      role: "CEO, EcommercePro",
      content: "Revenue tracking and analytics gave us insights we never had before. The automatic invoice generation is a huge time saver.",
      rating: 5
    },
    {
      name: "Mark Johnson",
      role: "CTO, StartupXYZ",
      content: "GitHub integration is seamless. We automated our entire deployment pipeline using DEBBY webhooks. Game changer for our team.",
      rating: 5
    },
    {
      name: "Amanda White",
      role: "Founder, PaymentSolutions",
      content: "The security features give us confidence to handle sensitive payment data. SOC 2 compliance was a major factor in our decision.",
      rating: 5
    },
    {
      name: "Chris Brown",
      role: "Lead Engineer, TechVentures",
      content: "Event logging and analytics helped us identify bottlenecks in our system. The detailed delivery history is invaluable for debugging.",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "Operations Manager, BusinessPlus",
      content: "Setting up recurring payments for our subscription service was incredibly straightforward. Customer onboarding time reduced by 60%.",
      rating: 5
    },
    {
      name: "Alex Rivera",
      role: "Content Creator, 500K Followers",
      content: "DEBBY's scheduling feature has saved me hours every week. I can plan my X and Threads content weeks in advance and focus on creating.",
      rating: 5
    },
    {
      name: "Nina Patel",
      role: "Influencer & Brand Consultant",
      content: "The analytics dashboard showed me exactly when my audience is most active. My engagement rate doubled within a month of using DEBBY!",
      rating: 5
    },
    {
      name: "Jordan Taylor",
      role: "Tech Creator, @JordanCodes",
      content: "Cross-posting between X and Threads is seamless. The content calendar makes it easy to maintain a consistent presence across platforms.",
      rating: 5
    }
  ];

  // Auto-rotate testimonials carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, this would submit to your backend
      toast.success("Thank you for your testimonial! We'll review it shortly.");
      setTestimonialForm({ name: "", role: "", content: "", rating: 5 });
      setFormErrors({});
    } catch (error) {
      toast.error("Failed to submit testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get testimonials for current carousel view (6 at a time: 3x2 grid)
  const getCurrentTestimonials = () => {
    const startIndex = currentTestimonialIndex * 6;
    return testimonials.slice(startIndex, startIndex + 6);
  };

  const faqs = [
    {
      question: "What's the difference between Developer and Business plans?",
      answer: "Developer plans focus on API keys, webhooks, GitHub integration, and developer tools. Business plans include payment processing, customer management, notifications, and revenue tracking. Both share the same secure infrastructure."
    },
    {
      question: "How secure is my data?",
      answer: "We use bank-level AES-256 encryption, SOC 2 compliant infrastructure, role-based access control, and comprehensive audit logs. Your API keys and sensitive data are encrypted at rest and in transit."
    },
    {
      question: "Can I switch between Developer and Business plans?",
      answer: "Yes, you can upgrade or change your plan at any time. Your data and integrations are preserved when switching plans. Contact support for assistance with plan changes."
    },
    {
      question: "What payment gateways are supported?",
      answer: "We support Stripe and Paystack for payment processing. Both gateways support automatic payment link generation, recurring payments, and card linking for auto-debit."
    },
    {
      question: "How do webhook retries work?",
      answer: "Webhooks automatically retry failed deliveries with configurable retry policies. You can set the maximum number of retries, and we use exponential backoff to avoid overwhelming your endpoints."
    },
    {
      question: "Is there an API available?",
      answer: "Yes, DEBBY provides a comprehensive REST API for all features. Generate API keys from your dashboard and use them to manage webhooks, events, payments, and more programmatically."
    },
    {
      question: "How many social accounts can I connect as a Creator?",
      answer: "Free plan: 1 Social Account. Starter plan: 3 Social Accounts. Pro plan: 10 Social Accounts. Enterprise plan: Unlimited social accounts across all platforms. Higher tiers also include advanced analytics and team collaboration tools."
    },
    {
      question: "What social platforms are supported for Creators?",
      answer: "We currently support X (Twitter) and Threads integration. You can schedule posts with text and images, automate content publishing, and track engagement metrics across both platforms."
    }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#0a1628]">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiArrowRight className="w-5 h-5 rotate-[-90deg]" />
        </button>
      )}

      <Navbar />

      {/* Hero Section */}
      <section id="main-content" className="relative pt-32 pb-20 px-4 overflow-hidden" data-animate aria-label="Hero section">
        {/* Dark mode background only - light mode inherits from body */}
        <div className="absolute inset-0 z-0 bg-transparent dark:bg-[#0a1628]">
          {/* Automation orbit animation */}
          <div className="absolute inset-x-0 top-1 md:-top-24 flex justify-center pointer-events-none">
            <motion.div
              className="w-[min(140vw,2000px)]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.130 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ transform: "rotate(90deg)" }}
            >
              <svg
                viewBox="0 0 640 80"
                className="w-full h-auto"
                role="img"
                aria-label="Animated automation orbit"
              >
                <defs>
                  <linearGradient id="hero-orbit-track" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.35" />
                  </linearGradient>
                  <radialGradient id="hero-orbit-dot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
                  </radialGradient>
                  <radialGradient id="hero-orbit-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
                  </radialGradient>
                  <path
                    id="hero-orbit-path"
                    d="M 40 130 a 280 56 0 1 0 560 0 a 280 56 0 1 0 -560 0"
                  />
                </defs>

                <ellipse
                  cx="320"
                  cy="130"
                  rx="280"
                  ry="56"
                  fill="none"
                  stroke="url(#hero-orbit-track)"
                  strokeWidth="2.2"
                />
                <ellipse
                  cx="320"
                  cy="130"
                  rx="280"
                  ry="56"
                  fill="none"
                  stroke="#22d3ee"
                  strokeOpacity="0.2"
                  strokeWidth="1.2"
                  strokeDasharray="8 10"
                />

                <circle r="18" fill="url(#hero-orbit-glow)" opacity="0.55">
                  <animate attributeName="opacity" values="0.25;0.65;0.25" dur="2.4s" repeatCount="indefinite" />
                  <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#hero-orbit-path" />
                  </animateMotion>
                </circle>
                <circle r="7.5" fill="url(#hero-orbit-dot)">
                  <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#hero-orbit-path" />
                  </animateMotion>
                </circle>

                <circle r="8" fill="url(#hero-orbit-glow)" opacity="0.35">
                  <animate attributeName="opacity" values="0.12;0.4;0.12" dur="2s" repeatCount="indefinite" />
                  <animateMotion dur="8s" begin="-3.2s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#hero-orbit-path" />
                  </animateMotion>
                </circle>
              </svg>
            </motion.div>
          </div>

          {/* Decorative blur elements - moving around */}
          <motion.div 
            className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl hidden dark:block"
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -40, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl hidden dark:block"
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 70, -50, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        {/* Content - in front */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/80 dark:bg-[#0f1f3a]/80 backdrop-blur-xl rounded-full px-5 py-2 shadow-lg mb-8 border border-gray-200/50 dark:border-gray-700/50"
            >
              <motion.span
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Trusted by 10,000+ developers, businesses & creators</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight"
            >
              Automate Your
              <motion.span
                className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {" "}Workflow
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-2xl text-gray-700 dark:text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              The all-in-one platform for <span className="text-blue-600 dark:text-blue-400">developers</span>, <span className="text-indigo-600 dark:text-indigo-400">businesses</span>, and <span className="text-pink-600 dark:text-pink-400">creators</span> to automate workflows, schedule content, process payments, and scale effortlessly.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Build powerful integrations, manage webhooks, process payments, schedule social media content, and automate everything—all in one secure, scalable platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-4 justify-center flex-wrap mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/signup" 
                  className={`btn btn-primary text-lg py-2 md:py-4 px-4 md:px-8 gap-2 shadow-lg hover:shadow-xl transition-all ${
                    ctaVariant === "highlighted" ? "animate-pulse" : ""
                  }`}
                  onClick={() => {
                    analytics.trackEvent("cta_click", { variant: ctaVariant, location: "hero" });
                    analytics.trackConversion("signup_click");
                    abTesting.trackConversion("cta_button", ctaVariant, "signup_click");
                  }}
                >
                  Start Free Trial
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login" 
                  className="btn btn-secondary text-lg py-2 md:py-4 px-4 md:px-8 border-2"
                  onClick={() => analytics.trackEvent("cta_click", { location: "hero", type: "login" })}
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <motion.div
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white mb-3 mx-auto"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Role Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-20"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-white/10 rounded-3xl p-5 shadow-xl border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-lg">
                  <FiCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">For Developers</h3>
                  <p className="text-gray-600 dark:text-gray-200">Build and automate with powerful tools</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">API Key Management & Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Webhook Automation with Retry Logic</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">GitHub Integration & Event Tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Real-time Analytics & Event Logging</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Webhook Playground & Developer Tools</span>
                </li>
              </ul>
              <motion.div whileHover={{ x: 5 }}>
                <Link to="/signup" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                  Get Started as Developer
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-white/10 rounded-3xl p-5 shadow-xl border-2 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl text-white shadow-lg">
                  <FiBriefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">For Businesses</h3>
                  <p className="text-gray-600 dark:text-gray-200">Run storefront, payments, and fulfillment from one dashboard</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Multi-shop storefront with category templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Variant-based products (size, color, texture, length)</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Checkout + payment links with Stripe & Paystack</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Order tracking: pending, paid, in-transit, delivered</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Customer records, communication history, and revenue analytics</span>
                </li>
              </ul>
              <motion.div whileHover={{ x: 5 }}>
                <Link to="/signup" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                  Get Started with Debby Business
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Creator Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-white/10 rounded-3xl p-5 shadow-xl border-2 border-pink-100 dark:border-pink-900/50 hover:border-pink-300 dark:hover:border-pink-700 transition-all md:col-span-3 lg:col-span-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl text-white shadow-lg">
                  <FiShare2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">For Creators</h3>
                  <p className="text-gray-600 dark:text-gray-200">Grow your audience & automate content</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Link X (Twitter) & Threads Accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Schedule Posts (Text, Images, or Both)</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Automate Content Publishing</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Traffic & Engagement Analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-white text-sm">Audience Growth Insights</span>
                </li>
              </ul>
              <motion.div whileHover={{ x: 5 }}>
                <Link to="/signup" className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 font-semibold">
                  Get Started as Creator
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-[#0a1628]" data-animate aria-label="Integrations">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("integrations") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="integrations">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Seamless Integrations</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with the tools and services you already use. One-click setup, instant connectivity.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 lg:flex-nowrap">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="group bg-white dark:bg-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center border border-gray-200 dark:border-gray-700 flex-1 min-w-[120px] max-w-[160px]"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${integration.color} text-white mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {integration.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{integration.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0a1628]" data-animate aria-label="Developer features">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("developer-features") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="developer-features">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <FiCode className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Developer Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Built for Developers</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Powerful tools and APIs to automate your development workflow. Everything you need to build, deploy, and monitor integrations.
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {developerFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="group bg-white dark:bg-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white text-2xl mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4 text-sm">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-200"
                    >
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Developer Plans */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Developer Plans</h3>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl md:mx-auto"
            >
              {/* Free Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>1 API key</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>100 API calls/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5 webhooks</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  Start Free
                </Link>
              </motion.div>

              {/* Starter Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-700 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Starter</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$19<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5 API keys</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5,000 API calls/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>25 webhooks</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5 team members</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-sm">
                  Get Starter
                </Link>
              </motion.div>

              {/* Professional Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Professional</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$79<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>20 API keys</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>50,000 API calls/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>100 webhooks</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>20 team members</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  Get Professional
                </Link>
              </motion.div>

              {/* Enterprise Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Enterprise</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$249<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> API keys</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> API calls</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> webhooks</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>SLA guarantee</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium hover:from-gray-800 hover:to-black transition-colors text-sm">
                  Contact Sales
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Features Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-[#0a1628]" data-animate aria-label="Business features">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("business-features") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="business-features">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
              <FiBriefcase className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Business Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Everything Debby Business Delivers</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A unified operating layer for storefront, checkout, orders, customer operations, messaging, and revenue visibility.
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {businessFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="group bg-white dark:bg-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white text-2xl mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4 text-sm">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-200"
                    >
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Business Plans */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Business Plans</h3>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {/* Free Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>10 notifications/day</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>50 customers</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Basic payments</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  Start Free
                </Link>
              </motion.div>

              {/* Starter Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border-2 border-indigo-200 dark:border-indigo-700 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Starter</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$29<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>500 notifications/day</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>500 customers</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Email, SMS & WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5 team members</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm">
                  Get Starter
                </Link>
              </motion.div>

              {/* Professional Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Professional</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$99<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5,000 notifications/day</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>5,000 customers</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Advanced CRM</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>20 team members</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  Get Professional
                </Link>
              </motion.div>

              {/* Enterprise Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-800/20 dark:to-indigo-800/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Enterprise</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$299<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> notifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Unlimited</strong> customers</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>SLA guarantee</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors text-sm">
                  Contact Sales
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Creator Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0a1628]" data-animate aria-label="Creator features">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("creator-features") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="creator-features">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-pink-100 rounded-full px-4 py-2 mb-6">
              <FiShare2 className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">Creator Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Supercharge Your Social Presence</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect your X and Threads accounts, schedule content, and grow your audience with powerful analytics and automation tools.
            </p>
          </div>
          
          {/* Creator Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {creatorFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{ duration: 0.3 }}
                className="group bg-white dark:bg-white/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-300"
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white text-2xl mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4 text-sm">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-200"
                    >
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Creator Plans */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Creator Plans</h3>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {/* Free Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>1 Social Account</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>10 scheduled posts/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Basic scheduling</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 dark:text-gray-500 line-through">
                    <FiCheck className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  Start Free
                </Link>
              </motion.div>

              {/* Starter Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-5 border-2 border-pink-200 dark:border-pink-700 relative"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Starter</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$9<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>3 Social Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>100 scheduled posts/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Advanced scheduling</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors text-sm">
                  Get Starter
                </Link>
              </motion.div>

              {/* Pro Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-700"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pro</h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">$29<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>10 Social Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>500 posts/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span><strong>Detailed analytics</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-500" />
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors text-sm">
                  Get Pro
                </Link>
              </motion.div>

              {/* Enterprise Tier */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-black dark:to-gray-900 rounded-2xl p-5 border border-gray-700 dark:border-gray-800"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-white mb-1">Enterprise</h4>
                  <div className="text-3xl font-bold text-white">$99<span className="text-sm font-normal text-gray-400">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-center gap-2 text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span><strong>Unlimited accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Unlimited posts</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span><strong>Custom analytics</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Link to="/signup" className="block w-full text-center py-2 px-3 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors text-sm">
                  Contact Sales
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-[#0a1628]" data-animate aria-label="Use cases">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("use-cases") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="use-cases">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Use Cases</h2>
            <p className="text-xl text-gray-800 dark:text-gray-300 max-w-2xl mx-auto">
              See how teams use DEBBY to automate their workflows
            </p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid md:grid-cols-2 gap-8"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all bg-white dark:bg-[#0f1f3a]"
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${useCase.color} text-white mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {useCase.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:bg-[#0a1628]" data-animate aria-label="Security">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("security") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="security">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 mb-6">
                <FiShield className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white uppercase tracking-wide">Enterprise Security</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Bank-Level Security
                <span className="block text-gray-300 mt-2 text-3xl">Built In</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Your data and integrations are protected with industry-leading security measures. We take security seriously so you don't have to worry about compliance, encryption, or data breaches.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityFeatures.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <div className="text-white">{item.icon}</div>
                    <span className="text-gray-300">{item.feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-300">Uptime SLA</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">256-bit</div>
                <div className="text-gray-300">Encryption</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">SOC 2</div>
                <div className="text-gray-300">Compliant</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-300">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0a1628]" data-animate aria-label="Testimonials">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("testimonials") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="testimonials">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Loved by Developers & Businesses</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">See what our users are saying</p>
          </div>

          <div className="md:flex gap-8">
            {/* Testimonial Form - 30% */}
            <div className="w-full md:w-[30%] flex items-start">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-[#0f1f3a] rounded-3xl p-7 border-2 border-blue-200 dark:border-blue-900/50 sticky top-24 w-full">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-5">Share Your Experience</h3>
                <form onSubmit={handleTestimonialSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="testimonial-name" className="block text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">
                      Your Name
                    </label>
                    <motion.input
                      id="testimonial-name"
                      type="text"
                      value={testimonialForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTestimonialForm({ ...testimonialForm, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                      }}
                      whileFocus={{ scale: 1.02 }}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border-2 transition-all outline-none bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 ${
                        formErrors.name
                          ? "border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50"
                          : testimonialForm.name
                          ? "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-600 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/50"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50"
                      }`}
                      placeholder="John Doe"
                      required
                      aria-invalid={!!formErrors.name}
                      aria-describedby={formErrors.name ? "name-error" : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="testimonial-role" className="block text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">
                      Your Role
                    </label>
                    <input
                      id="testimonial-role"
                      type="text"
                      value={testimonialForm.role}
                      onChange={(e) => {
                        setTestimonialForm({ ...testimonialForm, role: e.target.value });
                        if (formErrors.role) setFormErrors({ ...formErrors, role: "" });
                      }}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-all outline-none bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 ${
                        formErrors.role
                          ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      placeholder="CTO, Company Name"
                      required
                      aria-invalid={!!formErrors.role}
                      aria-describedby={formErrors.role ? "role-error" : undefined}
                    />
                    {formErrors.role && (
                      <p id="role-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {formErrors.role}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-1" role="group" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setTestimonialForm({ ...testimonialForm, rating })}
                          className={`p-1 rounded transition-all hover:scale-110 ${
                            testimonialForm.rating >= rating
                              ? "text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30"
                              : "text-gray-300 dark:text-gray-600 hover:text-yellow-300 dark:hover:text-yellow-400"
                          }`}
                          aria-label={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
                        >
                          <FiStar className={`w-4 h-4 ${testimonialForm.rating >= rating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="testimonial-content" className="block text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">
                      Your Testimonial
                    </label>
                    <motion.textarea
                      id="testimonial-content"
                      value={testimonialForm.content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setTestimonialForm({ ...testimonialForm, content: e.target.value });
                        if (formErrors.content) setFormErrors({ ...formErrors, content: "" });
                      }}
                      whileFocus={{ scale: 1.01 }}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all resize-none outline-none bg-white dark:bg-white text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 ${
                        formErrors.content
                          ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      rows={4}
                      placeholder="Share your experience..."
                      required
                      maxLength={500}
                      aria-invalid={!!formErrors.content}
                      aria-describedby={formErrors.content ? "content-error" : undefined}
                    />
                    {formErrors.content && (
                      <p id="content-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {formErrors.content}
                      </p>
                    )}
                    <p className={`mt-1 text-xs ${
                      testimonialForm.content.length > 450 ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {testimonialForm.content.length}/500 characters
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Testimonial"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Testimonials Carousel - 70% */}
            <div className="w-full md:w-[70%] mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonialIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {getCurrentTestimonials().map((testimonial, index) => (
                    <motion.div
                      key={`${currentTestimonialIndex}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gray-50 dark:bg-white/10 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    >
                      <motion.div
                        className="flex gap-1 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                      >
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 + i * 0.05 }}
                          >
                            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </motion.div>
                        ))}
                      </motion.div>
                      <p className="text-gray-700 dark:text-white mb-4 leading-relaxed text-sm">"{testimonial.content}"</p>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{testimonial.role}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(Math.ceil(testimonials.length / 6))].map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentTestimonialIndex(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-2 rounded-full transition-all ${
                      currentTestimonialIndex === index
                        ? "bg-blue-600 dark:bg-blue-500 w-8"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-2"
                    }`}
                    aria-label={`Go to testimonial page ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-[#0a1628]" data-animate aria-label="Frequently asked questions">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("faq") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="faq">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Everything you need to know</p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <motion.button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  className="w-full flex items-center justify-between p-6 text-left dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {openFaq === index ? (
                      <FiChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                    )}
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-200 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0a1628]" data-animate aria-label="Newsletter signup">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("newsletter") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="newsletter">
          <NewsletterSignup />
        </div>
      </section>

      {/* Social Proof Section - Customer Logos */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-[#0a1628] border-b border-gray-200 dark:border-gray-700" data-animate aria-label="Trusted by companies">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("social-proof") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="social-proof">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-8">
              Trusted by innovative companies worldwide
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {["TechCorp", "StartupXYZ", "DevHub", "CloudSync", "DataFlow", "AppBuilder"].map((company, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center p-4 bg-white dark:bg-[#0f1f3a] rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0a1628]" data-animate aria-label="Video demonstration">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ease-out ${
          visibleSections.has("video-demo") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="video-demo">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              See DEBBY in Action
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Watch how teams use DEBBY to automate workflows and boost productivity
            </p>
          </div>
          <div className="relative aspect-video bg-gray-900 dark:bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="w-20 h-20 bg-white/90 dark:bg-white/10 rounded-full flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm"
                aria-label="Play video"
              >
                <FiPlay className="w-10 h-10 text-blue-600 dark:text-blue-400 ml-1" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm">Demo: Automating payment workflows with DEBBY</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 dark:bg-[#0a1628] border-t border-gray-700 dark:border-gray-700" data-animate aria-label="Call to action">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:hidden"></div>
        <div className={`relative max-w-4xl mx-auto text-center transition-all duration-1000 ease-out ${
          visibleSections.has("cta") ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
        }`} id="cta">
          <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-gray-100 mb-6">Ready to Get Started?</h2>
          <p className="text-base text-blue-100 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of developers and businesses automating their workflows with DEBBY. Start your free trial today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-2 md:py-4 px-4 md:px-10 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg">
              Create Your Account
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold py-2 md:py-4 px-4 md:px-10 rounded-xl backdrop-blur-xl hover:bg-white/30 transition-all text-lg border-2 border-white/30">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={toast.remove} />

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-[#0a1628] text-gray-300 dark:text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-black text-lg font-logo">D</span>
                </div>
                <h3 className="text-2xl font-black text-white dark:text-gray-100 font-logo tracking-wider">DEBBY</h3>
              </div>
              <p className="text-gray-400 dark:text-gray-300 leading-relaxed">
                The all-in-one automation platform for developers, businesses, and creators. Build, integrate, and grow effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white dark:text-gray-100 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/integrations" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Integrations</Link></li>
                <li><Link to="/automations" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Automations</Link></li>
                <li><Link to="/pricing" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Pricing</Link></li>
                <li><Link to="/signup" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white dark:text-gray-100 mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><Link to="/solutions" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">For Developers</Link></li>
                <li><Link to="/solutions" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">For Businesses</Link></li>
                <li><Link to="/solutions" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">For Creators</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white dark:text-gray-100 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white dark:text-gray-100 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Sign Up</Link></li>
                <li><Link to="/signup" className="text-gray-400 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 dark:text-gray-400">© 2026 DEBBY. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">Privacy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
};
