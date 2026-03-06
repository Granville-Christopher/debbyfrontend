import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  FiBell,
  FiBriefcase,
  FiCreditCard,
  FiLock,
  FiShoppingBag,
  FiUsers
} from "react-icons/fi";

export const BusinessLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 flex">
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-start pt-5 pb-5 px-8 xl:px-12 text-white relative overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <Link
            to="/"
            className="text-4xl xl:text-5xl font-bold mb-5 inline-block hover:opacity-90 transition-opacity bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent"
          >
            DEBBY
          </Link>

          <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
            Welcome back
            <span className="block text-blue-200 mt-2 text-3xl xl:text-4xl">
              Your business control tower is ready
            </span>
          </h1>

          <p className="text-lg text-slate-300 mb-6 leading-relaxed">
            Manage storefront operations, billing, customer relationships, and automation workflows
            from one business dashboard.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-500/30">
                <FiShoppingBag className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-blue-200">Storefront + Checkout</h3>
                <p className="text-slate-300">Products, categories, checkout flows, and order completion tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
                <FiUsers className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-cyan-200">CRM + Audience</h3>
                <p className="text-slate-300">Customer records, segmentation, follow-ups, and lifecycle visibility.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                <FiCreditCard className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-emerald-200">Billing + Payments</h3>
                <p className="text-slate-300">Subscription billing, payment health, and gateway orchestration.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-500/20 rounded-xl backdrop-blur-sm border border-violet-500/30">
                <FiBell className="w-6 h-6 text-violet-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-violet-200">Automation + Messaging</h3>
                <p className="text-slate-300">Email, SMS, and WhatsApp automations with campaign intelligence.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <FiLock className="w-6 h-6 text-slate-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-slate-100">Secure by default</h3>
                <p className="text-slate-300">Auditability, role protections, and encrypted operational data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[56%] flex items-center justify-center p-2 md:p-6 lg:p-10">
        <div className="w-full md:max-w-md">
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/40 p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold mb-4">
                <FiBriefcase className="w-3.5 h-3.5" />
                Business Account
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
              <p className="text-sm sm:text-base text-gray-500">Access your Debby business dashboard</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-xl mb-6 text-sm shadow-lg shadow-red-100/50">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full text-sm sm:text-base py-3.5 sm:py-4 mb-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700 hover:from-blue-700 hover:via-indigo-700 hover:to-slate-800 shadow-blue-500/30"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm sm:text-base text-gray-500 mt-8">
              Don&apos;t have a business account?{" "}
              <Link to="/business/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
