import { motion } from "framer-motion";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend as ChartLegend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  FiActivity,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMail,
  FiMessageSquare,
  FiShield,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { SiStripe, SiWhatsapp } from "react-icons/si";
import type { ComponentType } from "react";
import { LandingButton } from "./LandingButton";
import { useCountUp } from "../../hooks/useCountUp";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, ChartLegend, Filler);

const kpis = [
  { label: "Orders Completed", end: 24853, prefix: "", icon: FiShoppingBag, accent: "text-blue-600 dark:text-blue-400" },
  { label: "Total Revenue", end: 1420000, prefix: "$", icon: FiDollarSign, accent: "text-emerald-600 dark:text-emerald-400" },
  { label: "MRR", end: 89500, prefix: "$", icon: FiTrendingUp, accent: "text-indigo-600 dark:text-indigo-400" },
  { label: "Notifications Sent", end: 142300, prefix: "", icon: FiBell, accent: "text-amber-600 dark:text-amber-300" },
];

const liveEvents = [
  {
    title: "Order placed",
    detail: "Sneaker Drop x2",
    time: "2s ago",
    meta: "Checkout • #4821",
    statusLabel: "Successful",
    icon: FiShoppingBag
  },
  {
    title: "Payment confirmed",
    detail: "$247.00 via Stripe",
    time: "12s ago",
    meta: "Authorization cleared",
    statusLabel: "Confirmed",
    icon: FiCheckCircle
  },
  {
    title: "Reminder sent",
    detail: "Abandoned cart follow-up",
    time: "45s ago",
    meta: "WhatsApp + Email",
    statusLabel: "Sent",
    icon: FiMessageSquare
  },
];

const channels: Array<{
  label: string;
  icon?: ComponentType<{ className?: string }>;
  logoSrc?: string;
  logoAlt?: string;
  wideLogo?: boolean;
  iconClassName: string;
  fallback?: string;
}> = [
  { label: "Email", icon: FiMail, iconClassName: "text-slate-600 dark:text-slate-300" },
  { label: "SMS", icon: FiMessageSquare, iconClassName: "text-slate-600 dark:text-slate-300" },
  { label: "WhatsApp", icon: SiWhatsapp, iconClassName: "text-green-600 dark:text-green-400" },
  { label: "Stripe", icon: SiStripe, iconClassName: "text-indigo-600 dark:text-indigo-400" },
  {
    label: "Paystack",
    logoSrc: "/Paystack_idIi-h8rZ0_1.png",
    logoAlt: "Paystack logo",
    wideLogo: true,
    iconClassName: "text-cyan-600 dark:text-cyan-400",
    fallback: "P"
  }
];
const heroRevenueLabels = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
  "D11",
  "D12",
  "D13",
  "D14",
  "D15",
  "D16"
];
const heroRevenueData = {
  labels: heroRevenueLabels,
  datasets: [
    {
      label: "Revenue trend",
      data: [12, 16, 20, 24, 33, 30, 34, 39, 48, 45, 49, 57, 54, 65, 62, 70],
      fill: true,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.22)",
      pointRadius: 0,
      tension: 0.33,
      borderWidth: 2.4
    }
  ]
};
const heroRevenueOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2300,
    easing: "easeOutCubic" as const
  },
  animations: {
    y: {
      from: (ctx: any) => {
        const yScale = ctx?.chart?.scales?.y;
        return yScale ? yScale.getPixelForValue(0) : undefined;
      },
      duration: 2300,
      easing: "easeOutCubic" as const
    }
  },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } }
};

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return value.toLocaleString();
}

function SuccessStrokeBadge({ delay = 0, label }: { delay?: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        className="shrink-0"
        aria-hidden="true"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          fill="rgba(16, 185, 129, 0.12)"
          stroke="#10b981"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay, duration: 0.52, ease: "easeOut" }}
        />
        <motion.path
          d="M8.1 12.9L11.8 16.2L22.2 5.6"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.75 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: delay + 0.34, duration: 0.62, ease: "easeOut" }}
        />
      </motion.svg>
      <motion.span
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 1.01, duration: 0.22, ease: "easeOut" }}
        className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400"
      >
        {label}
      </motion.span>
    </div>
  );
}

function KPICard({
  label,
  end,
  prefix,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  end: number;
  prefix: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  accent: string;
  delay: number;
}) {
  const { count, ref } = useCountUp<HTMLParagraphElement>(end, 2500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + delay * 0.1, duration: 0.45 }}
      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/65 p-3 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/55 lg:p-6"
    >
      <div className={`rounded-xl bg-slate-100 p-2 dark:bg-slate-800 md:p-2 lg:p-2.5 ${accent}`}>
        <Icon size={18} />
      </div>
      <div>
        <p ref={ref} className="text-xs font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-xs lg:text-base">
          {prefix}
          {formatNumber(count)}
        </p>
        <p className="text-[8px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="bh-hero-bg relative min-h-screen scroll-mt-28 overflow-hidden py-28 sm:py-32 md:py-36 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-sky-200/60 bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 bh-glass-card md:mx-0 dark:border-sky-900/60 dark:text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live commerce command center
            </div>

            <h1 className="mb-5 text-2xl text-center md:text-start font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-2xl md:text-[2.1rem] lg:text-5xl">
              Run your entire commerce operation{" "}
              <span className="bh-gradient-text">from one dashboard.</span>
            </h1>

            <p className="mb-7 max-w-xl text-sm text-center md:text-start font-semibold leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base md:text-base lg:text-lg">
              Debby unifies storefront, CRM, billing, automations, and analytics so your team can
              scale without juggling disconnected tools.
            </p>

            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 items-center justify-center md:justify-start">
              <LandingButton to="/signup" size="md">
                Start 14-Day Trial
              </LandingButton>
              <LandingButton href="#operations" variant="outline" size="md">
                View Live Demo
              </LandingButton>
            </div>
            <p className="mt-3 text-xs text-center md:text-start font-medium text-slate-500 dark:text-slate-400">
              Includes a 14-day free Starter trial before subscription.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
            <div className="bh-glass-strong bh-water-highlight rounded-3xl p-4 md:p-6 shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Debby Business Dashboard
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Live Commerce Snapshot
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-center dark:border-slate-700/70 dark:bg-slate-900/45">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Orders</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">+128</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-center dark:border-slate-700/70 dark:bg-slate-900/45">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Conversion</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">4.8%</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-center dark:border-slate-700/70 dark:bg-slate-900/45">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Recovered</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">$2.4K</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {kpis.map((kpi, idx) => (
                  <KPICard key={kpi.label} {...kpi} delay={idx} />
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/65 p-4 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/55">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Revenue trend</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+24.5%</span>
                </div>
                <div className="relative h-20">
                  <Line data={heroRevenueData} options={heroRevenueOptions} aria-label="Revenue trend line chart" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 dark:border-slate-700/70 dark:bg-slate-900/45">
                <div className="flex items-center gap-2">
                  <FiActivity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Automation queue healthy
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">37 active</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.75 }}
          className="mt-8 hidden grid-cols-2 gap-4 md:grid lg:grid-cols-5"
        >
          {liveEvents.map((event, index) => (
            <div
              key={event.title}
              className="bh-glass-card flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <event.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0">
                <div className="mb-1 hidden md:block">
                  <SuccessStrokeBadge delay={0.95 + index * 0.34} label={event.statusLabel} />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{event.detail}</p>
                <div className="mt-1 hidden items-center gap-1.5 md:flex">
                  <span className="max-w-[130px] truncate rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                    {event.meta}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{event.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="bh-glass-card rounded-xl px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Platform health
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <FiShield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                99.98% uptime
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <FiClock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                p95 response: 182ms
              </div>
              <div className="hidden items-center gap-2 text-xs text-slate-700 dark:text-slate-300 md:flex">
                <FiCheckCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                error rate: 0.09%
              </div>
            </div>
            <div className="mt-2 hidden grid-cols-2 gap-1.5 md:grid">
              <span className="rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                queue lag: 4s
              </span>
              <span className="rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                webhooks: healthy
              </span>
            </div>
          </div>
          <div className="bh-glass-card col-span-2 rounded-xl px-4 py-3 lg:col-span-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Connected channels
            </p>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const ChannelIcon = channel.icon;
                return (
                <span
                  key={channel.label}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                >
                  <span
                    className={`mr-1.5 inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${
                      channel.wideLogo ? "h-4 rounded-md px-1.5" : "h-4 w-4 rounded-full"
                    }`}
                  >
                    {ChannelIcon ? (
                      <ChannelIcon className={`h-2.5 w-2.5 ${channel.iconClassName}`} />
                    ) : channel.logoSrc ? (
                      <img
                        src={channel.logoSrc}
                        alt={channel.logoAlt ?? `${channel.label} logo`}
                        className={channel.wideLogo ? "h-2.5 w-auto max-w-[34px] object-contain" : "h-2.5 w-2.5 object-contain"}
                        loading="lazy"
                      />
                    ) : (
                      <span className={`text-[9px] font-bold ${channel.iconClassName}`}>
                        {channel.fallback ?? channel.label.charAt(0)}
                      </span>
                    )}
                  </span>
                  {channel.label}
                </span>
                );
              })}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <FiMail className="h-3.5 w-3.5" />
              Provider-owned and merchant-controlled
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
