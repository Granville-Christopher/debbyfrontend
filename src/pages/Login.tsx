import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { apiRequest } from "../api/client";
import { FiGithub, FiCode, FiBriefcase, FiZap, FiLock, FiFeather } from "react-icons/fi";

export const Login = () => {
  const { login, refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const oauthError = searchParams.get("error");
    const oauthSuccess = searchParams.get("oauth");
    const accessToken = searchParams.get("access_token");
    
    if (oauthError === "oauth_failed") {
      setError("OAuth authentication failed. Please try again.");
    } else if (oauthError === "invalid_state") {
      setError("OAuth session expired. Please try again.");
    } else if (oauthError === "no_email") {
      setError("Could not retrieve email from OAuth provider. Please use email/password signup.");
    } else if (oauthSuccess === "success" && accessToken) {
      refresh().then(() => {
        navigate("/", { replace: true });
      });
    }
  }, [searchParams, refresh, navigate]);

  const handleOAuth = async (provider: "google" | "github") => {
    try {
      setOauthLoading(provider);
      setError(null);
      // Default to developer role for OAuth (only affects new accounts)
      // Existing accounts will use their stored role
      const role = provider === "github" ? "developer" : "developer";
      const response = await apiRequest<{ authUrl: string }>(`/api/oauth/${provider}?role=${role}&redirect=/`);
      window.location.href = response.authUrl;
    } catch (err: any) {
      setError(err?.response?.data?.error || `Failed to initiate ${provider} login`);
      setOauthLoading(null);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100 flex">
      {/* Left Side - About DEBBY */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 text-white relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900">
        {/* Decorative gradient orbs for each user type */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-xl">
          <Link to="/" className="text-5xl font-bold mb-8 inline-block hover:opacity-90 transition-opacity bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
            DEBBY
          </Link>
          
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Welcome Back
            <span className="block text-slate-400 mt-2 text-3xl xl:text-4xl">Your automation hub awaits</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            The all-in-one platform for developers, businesses, and creators to automate workflows, integrate APIs, manage social media, and scale operations effortlessly.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
                <FiCode className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-cyan-300">Developer Tools</h3>
                <p className="text-slate-400">API keys, webhooks, integrations, and powerful automation tools for developers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-500/30">
                <FiBriefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-blue-300">Business Automation</h3>
                <p className="text-slate-400">Payment processing, customer management, notifications, and recurring payments.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-500/20 rounded-xl backdrop-blur-sm border border-pink-500/30">
                <FiFeather className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-pink-300">Creator Studio</h3>
                <p className="text-slate-400">Schedule posts, manage X & Threads accounts, and track your social growth.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <FiLock className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-slate-200">Enterprise Security</h3>
                <p className="text-slate-400">Bank-level encryption, role-based access, and comprehensive audit logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-0 md:p-6 lg:p-12">
        <div className="w-full md:max-w-md">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/40 p-8 lg:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-gray-500">Sign in to access your dashboard</p>
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
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full text-sm sm:text-base py-3.5 sm:py-4 mb-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black shadow-slate-500/30"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-4 bg-white/80 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {oauthLoading === "google" ? "Connecting..." : "Continue with Google"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiGithub className="w-5 h-5 text-gray-900" />
                <span className="text-sm font-medium text-gray-700">
                  {oauthLoading === "github" ? "Connecting..." : "Continue with GitHub"}
                </span>
              </button>
            </div>

            <p className="text-center text-sm sm:text-base text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link to="/signup" className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
