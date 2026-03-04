import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const logos = ["Bloom", "Vetiver", "Luxe", "Noir Studio", "Casa", "Maison"];

export default function TrustStrip() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="border-y border-slate-200/70 bg-slate-100/60 py-16 dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="mb-8 text-sm text-slate-600 dark:text-slate-400"
        >
          Trusted by modern businesses across retail, beauty, fashion, and digital products.
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {logos.map((name, idx) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.08 }}
              className="bh-glass-card rounded-lg px-5 py-3"
            >
              <span className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

