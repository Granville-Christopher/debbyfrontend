import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { DarkModeToggle } from "../DarkModeToggle";
import { Logo } from "../Logo";
import { LandingButton } from "./LandingButton";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#testimonials" },
  { label: "Resources", href: "#footer" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <DarkModeToggle />
          <LandingButton href="#cta" variant="outline" size="sm">
            Book Demo
          </LandingButton>
          <LandingButton to="/signup" size="sm">
            Start 14-Day Trial
          </LandingButton>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-slate-700 dark:text-slate-100 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 overflow-hidden rounded-2xl border border-slate-200/70 bh-glass-strong dark:border-slate-700 md:hidden"
          >
            <div className="flex flex-col gap-4 p-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3">
                <DarkModeToggle />
                <LandingButton href="#cta" variant="outline" size="sm" className="flex-1">
                  Book Demo
                </LandingButton>
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
