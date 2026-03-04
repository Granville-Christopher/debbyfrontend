import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { LandingButton } from "./LandingButton";
import { BookDemoButton } from "./BookDemoButton";

export default function FinalCTA() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} id="cta" className="py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.55 }}
          className="bh-glass-strong bh-water-highlight mx-auto max-w-4xl rounded-3xl p-8 text-center sm:p-10 md:p-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl">
            Launch in minutes. <span className="bh-gradient-text">Scale with confidence.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Join teams already running storefront, billing, and automations from one control tower.
            Start with a 14-day free Starter trial.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LandingButton to="/signup" size="lg">
              Start 14-Day Trial
            </LandingButton>
            <BookDemoButton variant="outline" size="lg" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
