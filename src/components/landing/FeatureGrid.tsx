import { motion } from "framer-motion";
import {
  FiShoppingBag,
  FiUsers,
  FiRepeat,
  FiCreditCard,
  FiBarChart2,
  FiZap,
} from "react-icons/fi";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const features = [
  {
    icon: FiShoppingBag,
    title: "Storefront + Checkout",
    desc: "Fast storefronts with flexible product ops and clean checkout experiences.",
  },
  {
    icon: FiUsers,
    title: "CRM + Audience",
    desc: "Unified customer profiles, segmentation, and lifecycle context in one place.",
  },
  {
    icon: FiRepeat,
    title: "Billing + Subscriptions",
    desc: "Recurring billing, plan controls, and churn-aware visibility from one dashboard.",
  },
  {
    icon: FiCreditCard,
    title: "Payment Orchestration",
    desc: "Provider routing, fallback logic, settlement tracking, and reconciliation signals.",
  },
  {
    icon: FiBarChart2,
    title: "Analytics + Growth Signals",
    desc: "Real-time trend monitoring across GMV, MRR, retention, and conversion.",
  },
  {
    icon: FiZap,
    title: "Automations",
    desc: "Email, SMS, and WhatsApp workflows triggered by order and customer events.",
  },
];

export default function FeatureGrid() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} id="features" className="scroll-mt-28 py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 text-center md:mb-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl">
            Everything you need. <span className="bh-gradient-text">Nothing fragmented.</span>
          </h2>
          <p className="mx-auto max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Six core modules, one operating layer, no context switching.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="bh-glass-strong rounded-2xl p-6"
            >
              <div className="mb-4 w-fit rounded-xl bg-blue-100/80 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <feature.icon size={22} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

