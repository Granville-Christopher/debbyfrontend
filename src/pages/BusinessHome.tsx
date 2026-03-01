import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiUsers,
  FiShoppingBag,
  FiTrendingUp,
  FiZap,
  FiBarChart2,
  FiBell,
  FiActivity,
  FiSettings,
  FiClipboard,
  FiLink2,
  FiDollarSign,
  FiShield,
  FiGlobe,
  FiLock,
  FiChevronDown,
  FiMenu,
  FiX,
  FiStar,
  FiPackage,
  FiTruck,
  FiPieChart,
  FiMail,
  FiMessageSquare,
  FiRepeat,
} from "react-icons/fi";
import { Logo } from "../components/Logo";
import { DarkModeToggle } from "../components/DarkModeToggle";

/* ─── liquid blob SVG filter (reused in background) ─── */
const LiquidSVG = () => (
  <svg className="absolute w-0 h-0">
    <defs>
      <filter id="liquid">
        <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"
          result="liquid"
        />
        <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
      </filter>
    </defs>
  </svg>
);

/* ─── Animated counter hook ─── */
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
};

/* ─── Section wrapper with intersection observer ─── */
const FadeInSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   BUSINESS HOME PAGE
   ═══════════════════════════════════════════════════════ */
export const BusinessHome = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  /* ── stats ── */
  const rev = useCounter(12450);
  const orders = useCounter(2340);
  const uptime = useCounter(99);
  const integrations = useCounter(14);

  /* ── features derived from dashboard tabs ── */
  const features = [
    {
      icon: <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Real-Time Overview",
      description:
        "Live revenue tracking, payment volume, notification delivery rates, and integration health — all at a glance.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <FiCreditCard className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Payment Infrastructure",
      description:
        "Stripe & Paystack checkout, payment links, recurring subscriptions, installment plans, and multi-currency support.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "E-Commerce Shop Engine",
      description:
        "Multi-shop storefronts, product variants, category templates, supplier directories, and dropshipping support.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: <FiTruck className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Order & Logistics",
      description:
        "End-to-end order tracking, automated shipping labels via Shippo/EasyPost, returns management, and delivery workflows.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <FiUsers className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Customer Intelligence",
      description:
        "Customer segmentation, custom fields, CRM workspace, communication history, and automated NPS/CSAT surveys.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: <FiZap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Automation Engine",
      description:
        "Native workflow builder, email/SMS/WhatsApp automations, abandoned cart recovery, and event-driven triggers.",
      gradient: "from-amber-500 to-yellow-600",
    },
    {
      icon: <FiPieChart className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Analytics & Forecasting",
      description:
        "Revenue forecasting, advanced report builder, A/B testing, performance dashboards, and growth trend analysis.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: <FiShield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Ops & Compliance",
      description:
        "Accounting reconciliation, automated tax calculation, fraud scoring, risk flags, SLO monitoring, and audit trails.",
      gradient: "from-slate-600 to-gray-800",
    },
    {
      icon: <FiLink2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Integration Marketplace",
      description:
        "One-click connections for Stripe, Paystack, SendGrid, Twilio, Shopify, QuickBooks, Shippo, and more.",
      gradient: "from-indigo-500 to-blue-700",
    },
  ];

  /* ── dashboard tabs showcase ── */
  const dashboardTabs = [
    { icon: <FiBarChart2 />, label: "Overview" },
    { icon: <FiCreditCard />, label: "Payments" },
    { icon: <FiBell />, label: "Notifications" },
    { icon: <FiActivity />, label: "Intelligence" },
    { icon: <FiSettings />, label: "Ops" },
    { icon: <FiZap />, label: "Automation" },
    { icon: <FiUsers />, label: "Customers" },
    { icon: <FiTrendingUp />, label: "Analytics" },
    { icon: <FiClipboard />, label: "Surveys" },
    { icon: <FiShoppingBag />, label: "Shop" },
    { icon: <FiActivity />, label: "Activity" },
    { icon: <FiLink2 />, label: "Integrations" },
    { icon: <FiDollarSign />, label: "Billing" },
    { icon: <FiSettings />, label: "Settings" },
  ];

  /* ── pricing ── */
  const pricing = [
    {
      name: "Starter",
      price: "$29",
      description: "For small businesses getting started",
      features: [
        "1 Shop with unlimited products",
        "Stripe OR Paystack checkout",
        "Email & WhatsApp notifications",
        "Basic analytics dashboard",
        "5 automation workflows",
        "Community support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth",
      price: "$79",
      description: "For scaling e-commerce operations",
      features: [
        "3 Shops with unlimited products",
        "Stripe AND Paystack checkout",
        "Full notification channels",
        "Revenue intelligence & forecasting",
        "Unlimited automations",
        "Dropshipping & supplier management",
        "Customer segmentation & surveys",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$249",
      description: "For large-scale business operations",
      features: [
        "Unlimited shops",
        "All payment gateways",
        "Fraud detection & risk controls",
        "Tax automation (Global)",
        "Accounting reconciliation",
        "Shipping label generation",
        "Returns control panel",
        "SLO monitoring & alerts",
        "Custom integrations & API",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  /* ── FAQs ── */
  const faqs = [
    {
      q: "How quickly can I launch my online store?",
      a: "You can set up your first shop in under 10 minutes. Choose from product templates, connect a payment gateway, and start accepting orders immediately.",
    },
    {
      q: "What payment methods are supported?",
      a: "We integrate with Stripe (cards, Apple Pay, Google Pay) and Paystack (cards, bank transfers, mobile money). Payment links are generated automatically with webhook-confirmed status sync.",
    },
    {
      q: "Can I manage multiple shops from one dashboard?",
      a: "Yes! Depending on your plan, you can run multiple shops each with unique branding, products, categories, and checkout flows — all managed from a single dashboard.",
    },
    {
      q: "How does the automation engine work?",
      a: "Our native workflow builder lets you create event-driven automations triggered by orders, payments, and customer actions. Templates include abandoned cart recovery, order receipts, shipping updates, and more.",
    },
    {
      q: "Is my business data secure?",
      a: "Absolutely. We use end-to-end encryption, role-based access controls, and audit trails. Fraud detection rules and risk scoring help protect every transaction.",
    },
    {
      q: "What integrations come built-in?",
      a: "Stripe, Paystack, SendGrid, Twilio, Shopify, QuickBooks, Xero, Shippo, EasyPost, and more. Our marketplace lets you connect new tools in one click.",
    },
  ];

  /* ── Testimonials ── */
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Founder, LuxeWear",
      text: "DEBBY replaced 6 different tools we were using. The dashboard gives us everything from payment tracking to customer insights in one place.",
      rating: 5,
    },
    {
      name: "James Okafor",
      role: "CEO, AfroMarket",
      text: "The Paystack integration and WhatsApp checkout changed our conversion game. Revenue is up 340% since we migrated.",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      role: "COO, StyleHub",
      text: "Fraud detection caught suspicious transactions we'd have missed. The ops dashboard pays for itself every month.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#030b1a] text-white overflow-hidden">
      <LiquidSVG />

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">Dashboard</a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Link to="/login" className="hidden sm:block text-sm text-gray-300 hover:text-white transition-colors font-medium">Login</Link>
            <Link to="/signup" className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30">
              Get Started
            </Link>
            <button
              className="md:hidden p-1.5 text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#030b1a]/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-3">
                <a href="#features" className="text-sm font-semibold text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                <a href="#dashboard" className="text-sm font-semibold text-white" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</a>
                <a href="#pricing" className="text-sm font-semibold text-white" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                <a href="#faq" className="text-sm font-semibold text-white" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                <hr className="border-white/10" />
                <Link to="/login" className="text-center py-2.5 text-sm rounded-xl border border-white/20 text-white font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="text-center py-2.5 text-sm rounded-xl bg-blue-600 text-white font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-24 sm:pt-36 lg:pt-44 pb-12 sm:pb-24 px-4 sm:px-6">
        {/* Liquid blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: "url(#liquid)" }}>
          <motion.div
            className="absolute -top-32 -left-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-blue-600/30 rounded-full"
            animate={{ x: [0, 60, -30, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -right-40 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-indigo-600/25 rounded-full"
            animate={{ x: [0, -50, 30, 0], y: [0, 60, -40, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-cyan-500/20 rounded-full"
            animate={{ x: [0, 40, -60, 0], y: [0, -30, 50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left – Copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-3 py-1 sm:px-5 sm:py-2 mb-5 sm:mb-6 border border-white/15"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[11px] sm:text-sm font-medium text-gray-200">Trusted by 2,400+ e-commerce businesses</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-4 sm:mb-6"
              >
                Your Complete{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  E-Commerce
                </span>{" "}
                Operating System
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-[13px] sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Payments, storefronts, orders, automations, analytics, fraud detection, and shipping — unified in one powerful dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-xs sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Start Free — 14 Day Trial
                  <FiArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-xl text-white px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-xs sm:text-base border border-white/15 hover:-translate-y-1 transition-all duration-300"
                >
                  See Dashboard
                </a>
              </motion.div>
            </div>

            {/* Right – Mock dashboard device */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="relative mx-auto lg:my-auto flex justify-center lg:justify-end max-w-full w-full lg:max-w-none"
            >
              <div className="relative w-full max-w-[540px]">
                {/* Glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-cyan-500/30 rounded-3xl blur-2xl" />

                {/* Dashboard screenshot */}
                <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-video">
                  <img
                    src="/dashboard-preview.png"
                    alt="DEBBY Business Dashboard — Overview with revenue charts, order stats, and payment tracking"
                    className="absolute w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="relative py-6 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-3 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
            {[
              { ref: rev.ref, val: `$${rev.count.toLocaleString()}`, suffix: "+", label: "Monthly Revenue Processed", icon: <FiDollarSign /> },
              { ref: orders.ref, val: orders.count.toLocaleString(), suffix: "+", label: "Orders Fulfilled", icon: <FiPackage /> },
              { ref: uptime.ref, val: `${uptime.count}`, suffix: ".9%", label: "Uptime Guarantee", icon: <FiShield /> },
              { ref: integrations.ref, val: `${integrations.count}`, suffix: "+", label: "Built-in Integrations", icon: <FiLink2 /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400">
                  {stat.icon}
                </div>
                <p className="text-lg sm:text-3xl font-extrabold text-white">
                  <span ref={stat.ref}>{stat.val}</span>
                  <span className="text-blue-400">{stat.suffix}</span>
                </p>
                <p className="text-[11px] sm:text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="relative py-14 sm:py-24 px-4 sm:px-6">
        {/* Liquid blob accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: "url(#liquid)" }}>
          <motion.div
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-blue-600/15 rounded-full"
            animate={{ x: [0, 50, -30, 0], y: [0, -40, 60, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <FadeInSection className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 rounded-full px-4 py-2 mb-4 sm:mb-6 border border-blue-400/20">
              <FiZap className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-blue-300 uppercase tracking-wider">Everything You Need</span>
            </div>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
              One Dashboard.{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Every Tool.
              </span>
            </h2>
            <p className="text-xs sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              14 integrated modules — from checkout to compliance — working together so your business runs on autopilot.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FadeInSection key={index} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group h-full bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-500"
                >
                  <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-sm sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DASHBOARD SHOWCASE ═══════ */}
      <section id="dashboard" className="relative py-14 sm:py-24 px-4 sm:px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
              14 Modules.{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                One Command Center.
              </span>
            </h2>
            <p className="text-xs sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Everything your business needs, accessible from a single sidebar.
            </p>
          </FadeInSection>

          {/* Tabs showcase – glassmorphism card */}
          <FadeInSection>
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-8 overflow-hidden">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {dashboardTabs.map((tab, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.08, y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-blue-500/20 backdrop-blur-xl rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-white/10 hover:border-blue-400/40 cursor-default transition-all duration-300"
                  >
                    <span className="text-blue-400 text-xs sm:text-base">{tab.icon}</span>
                    <span className="text-[11px] sm:text-sm font-medium text-gray-200">{tab.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Visual separator */}
              <div className="my-6 sm:my-8 border-t border-white/5" />

              {/* Highlights grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Payment Gateways", value: "Stripe, Paystack", icon: <FiCreditCard className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> },
                  { label: "Notification Channels", value: "Email, SMS, WhatsApp", icon: <FiBell className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> },
                  { label: "Automation Triggers", value: "Event-driven", icon: <FiZap className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> },
                  { label: "Analytics", value: "Real-time dashboards", icon: <FiTrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5">
                    <div className="text-blue-400 mb-2 sm:mb-3">{item.icon}</div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">{item.label}</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative py-14 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: "url(#liquid)" }}>
          <motion.div
            className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full"
            animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-4xl font-extrabold mb-3 sm:mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Growing Businesses
              </span>
            </h2>
            <p className="text-xs sm:text-base text-gray-400">Real results from real merchants.</p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <FadeInSection key={i} delay={i * 0.15}>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 h-full flex flex-col">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <FiStar key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-sm text-gray-300 leading-relaxed flex-1 mb-4 sm:mb-6">"{t.text}"</p>
                  <div>
                    <p className="text-[13px] sm:text-base font-bold text-white">{t.name}</p>
                    <p className="text-[11px] sm:text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="relative py-14 sm:py-24 px-4 sm:px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 rounded-full px-4 py-2 mb-4 sm:mb-6 border border-emerald-400/20">
              <FiDollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold text-emerald-300 uppercase tracking-wider">Pricing</span>
            </div>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
              Plans That{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Scale With You
              </span>
            </h2>
            <p className="text-xs sm:text-base text-gray-400 max-w-xl mx-auto">Start free. Upgrade as you grow. No hidden fees.</p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
            {pricing.map((plan, i) => (
              <FadeInSection key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-500 h-full flex flex-col ${
                    plan.popular
                      ? "bg-gradient-to-b from-blue-600/20 to-indigo-600/10 border-blue-500/40 backdrop-blur-2xl shadow-2xl shadow-blue-600/10"
                      : "bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-[11px] sm:text-sm text-gray-400 mb-4 sm:mb-6">{plan.description}</p>
                  <div className="mb-5 sm:mb-8">
                    <span className="text-2xl sm:text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs sm:text-base text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[11px] sm:text-sm text-gray-300">
                        <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className={`block text-center py-2 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base transition-all duration-300 hover:-translate-y-0.5 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl"
                        : "bg-white/10 text-white border border-white/15 hover:bg-white/15"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="relative py-14 sm:py-24 px-4 sm:px-6">
        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeInSection className="text-center mb-10 sm:mb-16">
            <h2 className="text-xl sm:text-4xl font-extrabold mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-base text-gray-400">Everything you need to know before getting started.</p>
          </FadeInSection>

          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <FadeInSection key={i} delay={i * 0.06}>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                  >
                    <span className="text-[13px] sm:text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-14 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: "url(#liquid)" }}>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <FadeInSection>
          <div className="relative z-10 max-w-4xl mx-auto text-center bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 sm:p-16 border border-white/15 shadow-2xl">
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6">
              Ready to Grow Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Business?
              </span>
            </h2>
            <p className="text-xs sm:text-lg text-gray-300 mb-5 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of merchants already using DEBBY to automate their e-commerce operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-xs sm:text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Start Free Trial
                <FiArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-7 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold text-xs sm:text-lg border border-white/15 hover:-translate-y-1 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative border-t border-white/10 py-8 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 leading-relaxed">
                The all-in-one e-commerce operating system for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-bold text-white mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><a href="#dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-bold text-white mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-bold text-white mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-500">© 2026 DEBBY. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <Link to="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
