import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiKey, FiShield } from "react-icons/fi";
import { useAdminAuth } from "../auth/AdminAuthProvider";

export const AdminSignup = () => {
  const navigate = useNavigate();
  const { register } = useAdminAuth();
  const controlClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/60";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSecret, setRegistrationSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        registrationSecret: registrationSecret || undefined
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
            <FiShield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Debby Internal</p>
            <h1 className="text-xl font-semibold text-slate-100">Create Admin Account</h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">First Name</label>
              <input
                type="text"
                className={controlClass}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Last Name</label>
              <input
                type="text"
                className={controlClass}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

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
            <input
              type="password"
              className={controlClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 12 characters"
              minLength={12}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">Registration Secret (required after first admin)</label>
            <div className="relative">
              <FiKey className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className={`${controlClass} pl-10`}
                value={registrationSecret}
                onChange={(event) => setRegistrationSecret(event.target.value)}
                placeholder="ADMIN_REGISTRATION_SECRET"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have admin access?{" "}
          <Link to="/admin/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
