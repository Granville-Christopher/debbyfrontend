import { motion } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const metrics = [
  { label: "GMV", value: 12400000, prefix: "$", type: "million" as const },
  { label: "Net Revenue", value: 3800000, prefix: "$", type: "million" as const },
  { label: "Take Rate", value: 3.2, prefix: "", suffix: "%", type: "decimal" as const },
  { label: "MRR Trend", value: 24, prefix: "+", suffix: "% MoM", type: "integer" as const },
];

function MetricCard({
  label,
  value,
  prefix,
  suffix = "",
  type,
  delay,
}: {
  label: string;
  value: number;
  prefix: string;
  suffix?: string;
  type: "million" | "decimal" | "integer";
  delay: number;
}) {
  const normalized = type === "decimal" ? Math.round(value * 10) : value;
  const { count, ref } = useCountUp(normalized, 2100);

  let display = "";
  if (type === "million") display = `${prefix}${(count / 1_000_000).toFixed(1)}M${suffix}`;
  else if (type === "decimal") display = `${prefix}${(count / 10).toFixed(1)}${suffix}`;
  else display = `${prefix}${count}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
      className="bh-glass-strong rounded-2xl p-6 text-center"
    >
      <p ref={ref} className="mb-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {display}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <div className="mt-4 flex h-8 items-end justify-center gap-0.5">
        {[30, 45, 35, 60, 50, 70, 55, 80, 75, 90, 85, 95].map((height, i) => (
          <motion.div
            key={`${label}-${i}`}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.4 + i * 0.035 }}
            className="w-1.5 rounded-full bg-blue-500/50"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function RevenueIntelligence() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="bg-slate-100/60 py-24 dark:bg-slate-900/35">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Revenue intelligence, <span className="bh-gradient-text">at a glance</span>
          </h2>
          <p className="mx-auto max-w-lg text-slate-600 dark:text-slate-400">
            Track financial momentum with clean, real-time metrics your team can act on.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

