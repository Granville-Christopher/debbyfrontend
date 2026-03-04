import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { API_BASE_URL } from "../../api/client";
import { useScrollReveal } from "../../hooks/useScrollReveal";

type HomepageReview = {
  name: string;
  role: string;
  text: string;
  rating: number;
};

const fallbackReviews: HomepageReview[] = [
  {
    name: "Amara Chen",
    role: "Founder, Bloom Skincare",
    text: "Debby removed operations noise across checkout, messaging, and billing. We now execute faster with fewer mistakes.",
    rating: 5,
  },
  {
    name: "Diego Marquez",
    role: "COO, Casa Living",
    text: "Our team moved from scattered tools to one clear command center. Cart recovery and delivery updates are now consistent.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Head of Ops, Noir Studio",
    text: "The visibility into revenue and lifecycle events helped us scale responsibly without adding operational complexity.",
    rating: 5,
  },
];

export default function Testimonials() {
  const { ref, isInView } = useScrollReveal();
  const [apiReviews, setApiReviews] = useState<HomepageReview[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/waitlist/business-homepage-reviews?limit=9`
        );
        if (!response.ok) return;
        const body = (await response.json().catch(() => ({}))) as {
          reviews?: Array<{
            name?: string;
            role?: string;
            text?: string;
            rating?: number;
          }>;
        };
        if (cancelled) return;
        const normalized = Array.isArray(body.reviews)
          ? body.reviews
              .map((entry) => ({
                name: String(entry.name || "").trim(),
                role: String(entry.role || "").trim(),
                text: String(entry.text || "").trim(),
                rating: Math.max(1, Math.min(5, Number(entry.rating || 5))),
              }))
              .filter((entry) => entry.name && entry.role && entry.text)
          : [];
        setApiReviews(normalized);
      } catch {
        // Keep static fallback testimonials.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reviews = useMemo(() => {
    if (apiReviews.length === 0) {
      return fallbackReviews;
    }

    const merged = [...fallbackReviews];
    const approvedSlice = apiReviews.slice(0, fallbackReviews.length);
    for (let i = 0; i < approvedSlice.length; i += 1) {
      merged[i] = approvedSlice[i];
    }
    return merged;
  }, [apiReviews]);

  return (
    <section ref={ref} id="testimonials" className="scroll-mt-28 py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 text-center md:mb-12"
        >
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl">
            Loved by <span className="bh-gradient-text">operators</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={`${review.name}-${index}`}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.45 }}
              className="bh-glass-strong flex h-full flex-col rounded-2xl p-6"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, star) => (
                  <FiStar key={`${review.name}-star-${star}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                "{review.text}"
              </p>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{review.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
