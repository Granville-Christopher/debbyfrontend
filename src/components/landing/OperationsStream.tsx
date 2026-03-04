import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiCreditCard,
  FiMessageCircle,
  FiRefreshCw,
  FiTruck,
  FiMail,
} from "react-icons/fi";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const events = [
  { icon: FiShoppingCart, text: "Order #4821 placed", detail: "Sneaker Drop x2", color: "text-blue-600 dark:text-blue-400", time: "Just now" },
  { icon: FiCreditCard, text: "Payment confirmed", detail: "$247.00 via Stripe", color: "text-emerald-600 dark:text-emerald-400", time: "12s ago" },
  { icon: FiMessageCircle, text: "Reminder sent", detail: "Abandoned cart follow-up", color: "text-amber-600 dark:text-amber-300", time: "45s ago" },
  { icon: FiRefreshCw, text: "Cart recovered", detail: "$89.00 order restored", color: "text-indigo-600 dark:text-indigo-400", time: "1m ago" },
  { icon: FiTruck, text: "Delivery update sent", detail: "Order #4819 out for delivery", color: "text-cyan-600 dark:text-cyan-400", time: "2m ago" },
  { icon: FiMail, text: "Welcome flow triggered", detail: "New subscriber onboarded", color: "text-violet-600 dark:text-violet-400", time: "3m ago" },
];

export default function OperationsStream() {
  const { ref, isInView } = useScrollReveal();
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setVisibleCount((count) => {
        if (count >= events.length) {
          clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, 550);

    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section ref={ref} id="operations" className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl"
          >
            Your operations, <span className="bh-gradient-text">streaming live</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.15 }}
            className="mx-auto max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base"
          >
            Watch your events move automatically from checkout to fulfillment in one timeline.
          </motion.p>
        </div>

        <div className="mx-auto max-w-xl space-y-3">
          <AnimatePresence>
            {events.slice(0, visibleCount).map((event, index) => (
              <motion.div
                key={`${event.text}-${index}`}
                initial={{ opacity: 0, x: -24, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bh-glass-card flex items-center gap-4 rounded-xl p-4"
              >
                <div className={`rounded-lg bg-slate-100 p-2 dark:bg-slate-800 ${event.color}`}>
                  <event.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.text}</p>
                  <p className="truncate text-xs text-slate-600 dark:text-slate-400">{event.detail}</p>
                </div>
                <span className="whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-500">{event.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
