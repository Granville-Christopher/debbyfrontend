import React, { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiGrid } from "react-icons/fi";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  accent: string;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const PitchDeck = () => {
  const [index, setIndex] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  const slides = useMemo<Slide[]>(
    () => [
      {
        id: "01",
        title: "Debby",
        subtitle: "Autonomous Commerce Operating System for SMBs",
        accent: "from-cyan-500/30 via-blue-500/20 to-indigo-500/30",
        content: (
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-slate-200 max-w-3xl">
              Debby replaces disconnected tools with one execution layer for storefront, payments, workflows,
              fulfillment, growth automation, and analytics.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["One system", "instead of 10+ apps"],
                ["Lower cost", "single stack, less subscription sprawl"],
                ["Faster ops", "automated flows and recovery"],
                ["Better growth", "closed-loop attribution and action"]
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{k}</p>
                  <p className="text-sm text-slate-100 mt-1">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        id: "02",
        title: "Problem",
        subtitle: "SMBs run commerce across fragmented, fragile tooling",
        accent: "from-rose-500/30 via-orange-500/20 to-amber-500/30",
        content: (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-2">
              <h3 className="font-semibold text-slate-100">Operational Fragmentation</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Storefront in one tool, payments in another, support elsewhere.</li>
                <li>No unified run visibility across customer and payment lifecycle.</li>
                <li>Slow manual handoffs create fulfillment and revenue leakage.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-2">
              <h3 className="font-semibold text-slate-100">Growth Fragmentation</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Cart recovery, retention, ads, and analytics are app-by-app.</li>
                <li>Attribution is incomplete, making CAC and ROAS decisions noisy.</li>
                <li>Merchants pay more while getting weaker automation quality.</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: "03",
        title: "Solution",
        subtitle: "Detect -> Decide -> Act -> Learn",
        accent: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Detect", "Cart abandoned, checkout started, risk, churn signals"],
                ["Decide", "Best channel and incentive by policy and context"],
                ["Act", "Send WhatsApp/email/SMS, trigger ads, route fulfillment"],
                ["Learn", "Close loop with conversion and outcome feedback"]
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{k}</p>
                  <p className="text-sm text-slate-100 mt-1">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-slate-200">
                Debby provides one control plane for workflows, payment state, fulfillment, intelligence, and growth
                operations instead of app stitching.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "04",
        title: "Product",
        subtitle: "Unified modules, single control plane",
        accent: "from-violet-500/30 via-indigo-500/20 to-blue-500/30",
        content: (
          <div className="grid md:grid-cols-3 gap-3">
            {[
              ["Commerce Core", "Storefront, checkout, orders, customer profiles, returns"],
              ["Execution Layer", "Workflow runtime, retries, idempotency, dead-letter handling"],
              ["Integrations", "Payments, ads, accounting, shipping, support, analytics"],
              ["Growth Automation", "Abandoned cart, retention flows, campaign orchestration"],
              ["Fulfillment Modes", "Own inventory and dropship with supplier routing"],
              ["Observability", "Runs, failures, traces, control-plane diagnostics"]
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-100">{k}</p>
                <p className="text-sm text-slate-300 mt-1">{v}</p>
              </div>
            ))}
          </div>
        )
      },
      {
        id: "05",
        title: "Market",
        subtitle: "Large, global SMB commerce software spend",
        accent: "from-fuchsia-500/30 via-pink-500/20 to-rose-500/30",
        content: (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">TAM</p>
              <p className="text-3xl font-bold text-white mt-1">{money(120_000_000_000)}</p>
              <p className="text-sm text-slate-300 mt-2">Global commerce ops + automation + merchant SaaS.</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Initial Beachhead</p>
              <p className="text-3xl font-bold text-white mt-1">{money(8_000_000_000)}</p>
              <p className="text-sm text-slate-300 mt-2">
                SMB brands needing unified storefront + payment + automation stack.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "06",
        title: "Business Model",
        subtitle: "SaaS subscription + transaction and automation value",
        accent: "from-lime-500/30 via-emerald-500/20 to-teal-500/30",
        content: (
          <div className="grid md:grid-cols-3 gap-3">
            {[
              ["Basic", "Own-products flow, WhatsApp-first checkout, core storefront"],
              ["Pro", "Advanced checkout, dropship, supplier routing, deeper automation"],
              ["Enterprise", "Controls, compliance, custom integrations, support SLAs"]
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-100">{k}</p>
                <p className="text-sm text-slate-300 mt-1">{v}</p>
              </div>
            ))}
            <div className="md:col-span-3 rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="text-sm text-slate-200">
                Revenue streams: subscription tiers, transaction-linked services, premium connectors, and automation
                expansion.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "07",
        title: "Current Build",
        subtitle: "Strong execution foundation already shipped",
        accent: "from-sky-500/30 via-cyan-500/20 to-blue-500/30",
        content: (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="font-semibold text-slate-100">Shipped</p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1">
                <li>Storefront, carts, customer-linked orders, payment links</li>
                <li>Shop owner order workflows and status updates</li>
                <li>Dropship supplier mapping and inventory sync rails</li>
                <li>Marketplace integrations and ops execution endpoints</li>
                <li>Returns runtime and operational controls</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="font-semibold text-slate-100">Reliability Layer</p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1">
                <li>Idempotency and dedupe primitives</li>
                <li>Reconciliation and payment lifecycle recovery</li>
                <li>Workflow runtime, dead-letter, replay hooks</li>
                <li>Observability and execution diagnostics</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: "08",
        title: "Go-To-Market",
        subtitle: "Land with high-friction SMB workflows, expand by automation depth",
        accent: "from-amber-500/30 via-orange-500/20 to-rose-500/30",
        content: (
          <div className="space-y-3">
            {[
              "Acquire via founder-led sales and partner channels in SMB-heavy segments.",
              "Win on time-to-value: storefront + checkout + automation in one onboarding flow.",
              "Expand account usage through supplier ops, analytics, and campaign automation.",
              "Increase retention via workflow depth and cross-module switching costs."
            ].map((line) => (
              <div key={line} className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-slate-200">
                {line}
              </div>
            ))}
          </div>
        )
      },
      {
        id: "09",
        title: "Why We Win",
        subtitle: "Execution-native architecture, not plugin sprawl",
        accent: "from-indigo-500/30 via-violet-500/20 to-fuchsia-500/30",
        content: (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="font-semibold text-slate-100">Debby Advantage</p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1">
                <li>One data model across storefront, payments, and automation.</li>
                <li>Fewer integration failure points and faster decision loops.</li>
                <li>Built-in automation quality from end-to-end context.</li>
                <li>Operational visibility for every run and outcome.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="font-semibold text-slate-100">Outcome</p>
              <ul className="text-sm text-slate-300 mt-2 space-y-1">
                <li>Lower stack cost for merchants.</li>
                <li>Higher checkout completion and retention potential.</li>
                <li>Faster teams with fewer manual handoffs.</li>
                <li>Clearer attribution and better capital efficiency.</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: "10",
        title: "Roadmap and Ask",
        subtitle: "Scale autonomous commerce globally",
        accent: "from-emerald-500/30 via-blue-500/20 to-violet-500/30",
        content: (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ["Next 90 days", "Connector hardening, growth automation expansion, reconciliation guarantees"],
                ["Next 6 months", "Global checkout methods, tax/shipping depth, stronger intelligence outputs"],
                ["Next 12 months", "Category-leading autonomous commerce OS for SMBs"]
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <p className="font-semibold text-slate-100">{k}</p>
                  <p className="text-sm text-slate-300 mt-1">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-slate-200">
                Ask: strategic capital and operator partners to accelerate go-to-market, connector expansion, and
                global reliability.
              </p>
            </div>
          </div>
        )
      }
    ],
    []
  );

  const current = slides[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        setIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key.toLowerCase() === "home") {
        setIndex(0);
      } else if (event.key.toLowerCase() === "end") {
        setIndex(slides.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        .deck-title { font-family: 'Sora', system-ui, sans-serif; }
        .deck-body { font-family: 'Space Grotesk', system-ui, sans-serif; }
      `}</style>

      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Pitch Deck</p>
            <h1 className="deck-title text-sm sm:text-base font-bold truncate">Debby | Autonomous Commerce OS</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-9 w-9 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center"
              onClick={() => setShowOverview((prev) => !prev)}
              aria-label="Toggle overview"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              className="h-9 w-9 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center"
              onClick={() => window.print()}
              aria-label="Print deck"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all"
            style={{ width: `${((index + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 deck-body">
        {showOverview && (
          <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                onClick={() => {
                  setIndex(slideIndex);
                  setShowOverview(false);
                }}
                className={`text-left rounded-lg border px-3 py-2 transition ${
                  slideIndex === index
                    ? "border-cyan-300 bg-cyan-500/15"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Slide {slide.id}</p>
                <p className="text-xs font-semibold text-slate-100 mt-1 line-clamp-2">{slide.title}</p>
              </button>
            ))}
          </div>
        )}

        <section className="relative overflow-hidden rounded-2xl border border-white/15 min-h-[68vh]">
          <div className={`absolute inset-0 bg-gradient-to-br ${current.accent}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.06),transparent_35%)]" />
          <div className="relative z-10 p-5 sm:p-8 md:p-10">
            <div className="mb-6">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-300">Slide {current.id}</p>
              <h2 className="deck-title mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                {current.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-200">{current.subtitle}</p>
            </div>
            {current.content}
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-40"
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            disabled={index === 0}
          >
            <FiChevronLeft className="w-4 h-4" />
            <span className="text-sm">Previous</span>
          </button>
          <p className="text-xs text-slate-300">
            {index + 1} / {slides.length}
          </p>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-40"
            onClick={() => setIndex((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={index === slides.length - 1}
          >
            <span className="text-sm">Next</span>
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
