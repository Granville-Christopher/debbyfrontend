import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiShield } from "react-icons/fi";
import { useAdminAuth } from "../auth/AdminAuthProvider";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const controlClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/60";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError((err as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <FiShield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Debby Internal</p>
            <h1 className="text-xl font-semibold text-slate-100">Admin Control Tower</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Admin Email</label>
            <input
              type="email"
              className={controlClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@debby.co"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className={`${controlClass} pl-10`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an admin account?{" "}
          <Link to="/admin/signup" className="font-medium text-emerald-300 hover:text-emerald-200">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
