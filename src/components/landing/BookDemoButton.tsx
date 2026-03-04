import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCalendar, FiShield, FiZap } from "react-icons/fi";
import { apiRequest } from "../../api/client";
import { LandingButton } from "./LandingButton";

type BookDemoButtonProps = {
  label?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

type BookDemoFormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  roleTitle: string;
  country: string;
  website: string;
  monthlyVolume: string;
  message: string;
};

const createInitialForm = (): BookDemoFormState => ({
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  roleTitle: "",
  country: "",
  website: "",
  monthlyVolume: "",
  message: ""
});

export function BookDemoButton({
  label = "Book Demo",
  variant = "outline",
  size = "md",
  className
}: BookDemoButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState<BookDemoFormState>(createInitialForm);
  const fieldClass =
    "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const setField = (key: keyof BookDemoFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setOpen(false);
    setSaving(false);
    setStatus(null);
    setForm(createInitialForm());
  };

  const submit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setStatus("Full name and email are required.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await apiRequest<{ success: boolean; message: string; id: string }>("/waitlist/book-demo", {
        method: "POST",
        body: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          companyName: form.companyName.trim() || undefined,
          roleTitle: form.roleTitle.trim() || undefined,
          country: form.country.trim() || undefined,
          website: form.website.trim() || undefined,
          monthlyVolume: form.monthlyVolume.trim() || undefined,
          message: form.message.trim() || undefined
        }
      });
      setStatus("Demo request submitted. Debby team will contact you shortly.");
      setTimeout(() => {
        resetAndClose();
      }, 900);
    } catch (err: any) {
      setStatus(err?.response?.data?.error || err?.message || "Failed to submit demo request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <LandingButton
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </LandingButton>
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label="Close demo modal"
              onClick={resetAndClose}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            />
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/70 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
                  Live Product Walkthrough
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Book a Debby Demo
                </h3>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-xl border border-slate-300/80 p-2 text-slate-600 transition hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid max-h-[calc(100vh-8rem)] gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[1.1fr_1.9fr]">
              <aside className="space-y-3">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Tell us about your business and we will schedule a focused live demo with your exact flows.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    30-minute personalized session
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <FiZap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Storefront, billing, automations
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <FiShield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Team onboarding and setup guidance
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Full name *</label>
                    <input
                      className={fieldClass}
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Email *</label>
                    <input
                      className={fieldClass}
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Phone</label>
                    <input
                      className={fieldClass}
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+234..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company</label>
                    <input
                      className={fieldClass}
                      value={form.companyName}
                      onChange={(e) => setField("companyName", e.target.value)}
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Role</label>
                    <input
                      className={fieldClass}
                      value={form.roleTitle}
                      onChange={(e) => setField("roleTitle", e.target.value)}
                      placeholder="Founder / Ops Lead"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Country</label>
                    <input
                      className={fieldClass}
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                      placeholder="Nigeria"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Website</label>
                    <input
                      className={fieldClass}
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Monthly order volume</label>
                    <input
                      className={fieldClass}
                      value={form.monthlyVolume}
                      onChange={(e) => setField("monthlyVolume", e.target.value)}
                      placeholder="e.g. 1,000 - 5,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    What do you want to see in the demo?
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-[92px] py-2`}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Storefront, billing, automations, admin controls..."
                  />
                </div>

                {status && (
                  <div className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200">
                    {status}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    disabled={saving}
                    className="h-10 rounded-xl border border-slate-300/80 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={saving}
                    className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
