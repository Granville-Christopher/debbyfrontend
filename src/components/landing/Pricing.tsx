import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { LandingButton } from "./LandingButton";

type BillingCurrency = "NGN" | "USD";

const resolveHomepageCurrency = (): BillingCurrency => {
  if (typeof window === "undefined") return "USD";

  const localeSignals = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : [])
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);

  const isNigeriaLocale = localeSignals.some((locale) => /(?:-|_)NG$/i.test(locale));
  if (isNigeriaLocale) return "NGN";

  const timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || "").trim();
  if (timezone === "Africa/Lagos") return "NGN";

  return "USD";
};

const formatPlanPrice = (amount: number, currency: BillingCurrency) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "NGN" ? 0 : 0,
      maximumFractionDigits: currency === "NGN" ? 0 : 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: { NGN: 15000, USD: 19 },
    desc: "Low-friction adoption for new businesses.",
    features: [
      "Storefront + checkout",
      "Basic CRM + audience",
      "Email support",
      "Single team member",
      "WhatsApp completion optional",
    ],
    cta: "Start 14-Day Trial",
    featured: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: { NGN: 49000, USD: 59 },
    desc: "For growing brands with active transaction volume.",
    features: [
      "Everything in Starter",
      "Advanced automations",
      "Campaign and recovery tools",
      "Priority support",
      "Split-capable checkout required",
    ],
    cta: "Start 14-Day Trial",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: { NGN: 129000, USD: 149 },
    desc: "For high-volume teams needing deeper control.",
    features: [
      "Everything in Growth",
      "Advanced reporting and controls",
      "Highest limits",
      "Dedicated support path",
      "Lowest transaction fee",
    ],
    cta: "Book Demo",
    featured: false,
  },
];

const getRegionalFeeText = (planId: string, currency: BillingCurrency) => {
  if (planId === "starter") {
    return "Debby transaction fee: 0%";
  }
  if (planId === "growth") {
    return currency === "NGN"
      ? "Debby transaction fee: 0.50% per local transaction (cap NGN 2,000)"
      : "Debby transaction fee: 0.75% per international transaction";
  }
  if (planId === "scale") {
    return currency === "NGN"
      ? "Debby transaction fee: 0.25% per local transaction (cap NGN 1,000)"
      : "Debby transaction fee: 0.40% per international transaction";
  }
  return "";
};

export default function Pricing() {
  const { ref, isInView } = useScrollReveal();
  const [currency, setCurrency] = useState<BillingCurrency>("USD");

  useEffect(() => {
    setCurrency(resolveHomepageCurrency());
  }, []);

  return (
    <section ref={ref} id="pricing" className="bg-slate-100/60 py-24 dark:bg-slate-900/35">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Starter, Growth, <span className="bh-gradient-text">Scale</span>
          </h2>
          <p className="mx-auto max-w-lg text-slate-600 dark:text-slate-400">
            Simple pricing with clear limits and fee structure by tier.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-xs font-medium text-blue-700 dark:text-blue-300">
            All paid tiers include a 14-day free trial.
          </p>
          <p className="mx-auto mt-1 max-w-lg text-[11px] text-slate-500 dark:text-slate-400">
            Prices are shown in {currency} based on your region.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className={`relative flex h-full flex-col rounded-2xl p-6 ${
                plan.featured
                  ? "bh-glass-strong ring-2 ring-blue-500/30"
                  : "bh-glass-card"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
              <div className="mt-3 mb-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatPlanPrice(plan.price[currency], currency)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">per month</div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{plan.desc}</p>
              <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                {getRegionalFeeText(plan.id, currency)}
              </p>

              <ul className="my-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <LandingButton
                to={plan.cta === "Book Demo" ? "/signup" : "/signup"}
                variant={plan.featured ? "primary" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </LandingButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
