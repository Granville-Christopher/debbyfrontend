import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBell,
  FiCreditCard,
  FiMessageSquare,
  FiShoppingBag,
  FiZap
} from "react-icons/fi";

type ConsolidationCard = {
  title: string;
  icon: IconType;
  iconClassName: string;
  iconBgClassName: string;
};

const rows: ConsolidationCard[] = [
  {
    title: "Storefront operations",
    icon: FiShoppingBag,
    iconClassName: "text-blue-600 dark:text-blue-300",
    iconBgClassName: "bg-blue-100/80 dark:bg-blue-900/40"
  },
  {
    title: "Customer follow-ups",
    icon: FiMessageSquare,
    iconClassName: "text-cyan-600 dark:text-cyan-300",
    iconBgClassName: "bg-cyan-100/80 dark:bg-cyan-900/40"
  },
  {
    title: "Billing workflows",
    icon: FiCreditCard,
    iconClassName: "text-violet-600 dark:text-violet-300",
    iconBgClassName: "bg-violet-100/80 dark:bg-violet-900/40"
  },
  {
    title: "Campaign automation",
    icon: FiZap,
    iconClassName: "text-amber-600 dark:text-amber-300",
    iconBgClassName: "bg-amber-100/80 dark:bg-amber-900/40"
  },
  {
    title: "Reconciliation visibility",
    icon: FiBarChart2,
    iconClassName: "text-emerald-600 dark:text-emerald-300",
    iconBgClassName: "bg-emerald-100/80 dark:bg-emerald-900/40"
  },
  {
    title: "Multi-channel notifications",
    icon: FiBell,
    iconClassName: "text-pink-600 dark:text-pink-300",
    iconBgClassName: "bg-pink-100/80 dark:bg-pink-900/40"
  }
];

const cards = [...rows, ...rows];

export default function ToolsReplaced() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="bg-slate-100/60 py-16 dark:bg-slate-900/35 md:py-20"
      id="consolidates"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-8 text-center md:mb-10"
        >
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl">
            What Debby <span className="bh-gradient-text">consolidates</span>
          </h2>
          <p className="mx-auto max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Your team keeps provider ownership while Debby orchestrates execution and visibility.
          </p>
        </motion.div>
      </div>

      <div className="overflow-hidden py-4 md:py-5">
        <div className="bh-marquee-track py-1">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
            <div
              key={`${card.title}-${index}`}
              className="bh-glass-strong mx-1.5 w-[38vw] min-w-[124px] max-w-[160px] rounded-xl p-3 shadow-[0_10px_22px_rgba(15,23,42,0.10)] dark:shadow-[0_12px_28px_rgba(2,6,23,0.42)] md:mx-3 md:w-auto md:min-w-[250px] md:max-w-none md:rounded-2xl md:p-6"
            >
              <div className="mb-4">
                <div
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg md:h-10 md:w-10 md:rounded-xl ${card.iconBgClassName}`}
                >
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${card.iconClassName}`} />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 md:text-sm">{card.title}</p>
              <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-400 md:text-xs">
                Unified in Debby Control Tower
              </p>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
