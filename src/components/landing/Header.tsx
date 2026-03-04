import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { DarkModeToggle } from "../DarkModeToggle";
import { Logo } from "../Logo";
import { LandingButton } from "./LandingButton";
import { BookDemoButton } from "./BookDemoButton";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#testimonials" },
  { label: "Resources", href: "#footer" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToHash = (hash: string) => {
    if (!hash || !hash.startsWith("#")) return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    const headerOffset = window.innerWidth >= 1024 ? 88 : 80;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    if (window.location.hash) {
      window.setTimeout(() => onHashChange(), 0);
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bh-glass-strong border-b border-slate-200/60 dark:border-slate-800/80 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="shrink-0">
          <Logo />
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => window.requestAnimationFrame(() => scrollToHash(link.href))}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile + Tablet top-level theme toggle (outside menu) */}
          <div className="lg:hidden">
            <DarkModeToggle />
          </div>

          {/* Tablet actions beside hamburger */}
          <div className="hidden items-center gap-2 md:flex lg:hidden">
            <BookDemoButton variant="outline" size="sm" />
            <LandingButton to="/signup" size="sm">
              Start Trial
            </LandingButton>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <DarkModeToggle />
            <BookDemoButton variant="outline" size="sm" />
            <LandingButton to="/signup" size="sm">
              Start 14-Day Trial
            </LandingButton>
          </div>

          <button
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-slate-700 dark:text-slate-100 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 overflow-hidden rounded-2xl border border-slate-200/70 bh-glass-strong dark:border-slate-700 lg:hidden"
          >
            <div className="flex flex-col gap-4 p-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setMobileOpen(false);
                    window.requestAnimationFrame(() => scrollToHash(link.href));
                  }}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 md:hidden">
                <BookDemoButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                />
                <LandingButton to="/signup" size="sm" className="flex-1">
                  Start 14-Day Trial
                </LandingButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
