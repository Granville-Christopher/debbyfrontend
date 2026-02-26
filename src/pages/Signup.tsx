import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { BusinessSignupProfile, Role, useAuth } from "../auth/AuthProvider";
import { apiRequest } from "../api/client";
import { FiGithub, FiCode, FiBriefcase, FiZap, FiLock, FiBarChart2, FiLink2, FiUsers, FiCheck, FiFeather, FiTwitter, FiCalendar, FiTrendingUp } from "react-icons/fi";

const BUSINESS_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "India",
  "United Arab Emirates",
  "Germany",
  "France",
  "Netherlands",
  "Brazil",
  "Australia",
  "Other"
];

const BUSINESS_INDUSTRIES = [
  "Retail and Ecommerce",
  "Fashion and Beauty",
  "Food and Beverage",
  "Technology",
  "Professional Services",
  "Education",
  "Health and Wellness",
  "Real Estate",
  "Travel and Hospitality",
  "Other"
];

const BUSINESS_TEAM_SIZES = ["Solo", "2-5", "6-20", "21-50", "51-200", "200+"];

export const Signup = () => {
  const { signup, refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("developer");
  const [businessProfile, setBusinessProfile] = useState<BusinessSignupProfile>({
    fullName: "",
    businessName: "",
    country: "",
    phone: "",
    industry: "",
    teamSize: "",
    website: ""
  });
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
      const response = await apiRequest<{ authUrl: string }>(`/api/oauth/${provider}?role=${role}&redirect=/`);
      window.location.href = response.authUrl;
    } catch (err: any) {
      setError(err?.response?.data?.error || `Failed to initiate ${provider} signup`);
      setOauthLoading(null);
    }
  };

  const updateBusinessProfile = (field: keyof BusinessSignupProfile, value: string) => {
    setBusinessProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let signupOptions: { businessProfile?: BusinessSignupProfile } | undefined;

      if (role === "business") {
        const requiredFields: Array<keyof BusinessSignupProfile> = [
          "fullName",
          "businessName",
          "country",
          "phone",
          "industry",
          "teamSize"
        ];
        const missingField = requiredFields.find((field) => !businessProfile[field]?.trim());
        if (missingField) {
          const labels: Record<string, string> = {
            fullName: "Full name",
            businessName: "Business name",
            country: "Country",
            phone: "Phone number",
            industry: "Industry",
            teamSize: "Team size"
          };
          setError(`${labels[missingField]} is required for business registration.`);
          setLoading(false);
          return;
        }

        signupOptions = {
          businessProfile: {
            ...businessProfile,
            fullName: businessProfile.fullName.trim(),
            businessName: businessProfile.businessName.trim(),
            country: businessProfile.country.trim(),
            phone: businessProfile.phone.trim(),
            industry: businessProfile.industry.trim(),
            teamSize: businessProfile.teamSize.trim(),
            website: businessProfile.website?.trim() || undefined
          }
        };
      }

      await signup(email, password, role, signupOptions);
      navigate("/");
    } catch (err: any) {
      let errorMsg = "Signup failed";
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.details?.fieldErrors?.body) {
          const fieldErrors = data.details.fieldErrors.body;
          const errors = Object.entries(fieldErrors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field === "password" ? "Password" : field === "email" ? "Email" : field;
              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`;
            })
            .join(", ");
          errorMsg = errors || data.error || "Validation failed";
        } else {
          errorMsg = data.error || "Signup failed";
        }
      } else {
        errorMsg = err?.message || "Signup failed";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const developerFeatures = [
    "API Keys & Webhooks",
    "GitHub Integration",
    "Event Logging & Analytics",
    "Team Collaboration",
    "Developer Documentation"
  ];

  const businessFeatures = [
    "Payment Processing",
    "Customer Management",
    "Email/SMS/WhatsApp Notifications",
    "Recurring Payments",
    "Revenue Tracking"
  ];

  const creatorFeatures = [
    "X & Threads Integration",
    "Post Scheduling",
    "Content Templates",
    "Audience Analytics",
    "Multi-Account Management"
  ];

  // Theme colors based on role
  const getThemeClasses = () => {
    switch (role) {
      case "developer":
        return {
          bg: "bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900",
          pageBg: "bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100",
          accent: "text-cyan-300",
          accentLight: "text-cyan-200",
          textMuted: "text-slate-300",
          checkColor: "text-cyan-400",
        };
      case "creator":
        return {
          bg: "bg-gradient-to-br from-pink-500 to-rose-600",
          pageBg: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50",
          accent: "text-pink-200",
          accentLight: "text-pink-100",
          textMuted: "text-pink-100",
          checkColor: "text-pink-200",
        };
      default: // business
        return {
          bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
          pageBg: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
          accent: "text-blue-200",
          accentLight: "text-blue-100",
          textMuted: "text-blue-100",
          checkColor: "text-blue-200",
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${theme.pageBg}`}>
      {/* Left Side - About DEBBY */}
      <div className={`hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 text-white relative overflow-hidden transition-all duration-300 ${theme.bg}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-xl">
          <Link to="/" className="text-5xl font-bold mb-8 inline-block hover:opacity-90 transition-opacity">
            DEBBY
          </Link>
          
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            {role === "developer" && "Build. Integrate. Deploy."}
            {role === "business" && "Start Automating Today"}
            {role === "creator" && "Create. Schedule. Grow."}
            <span className={`block mt-2 ${theme.accent}`}>
              {role === "developer" && "Power your applications"}
              {role === "business" && "Join thousands of users"}
              {role === "creator" && "Amplify your voice"}
            </span>
          </h1>
          
          <p className={`text-xl mb-10 leading-relaxed ${theme.textMuted}`}>
            {role === "developer" && "Access powerful APIs, webhooks, and integrations. Build automation workflows with enterprise-grade security and reliability."}
            {role === "business" && "Create your account and unlock powerful automation tools. Whether you're building APIs or running a business, DEBBY has everything you need."}
            {role === "creator" && "Connect your social accounts, schedule content, and track your growth. Build your audience with smart automation tools."}
          </p>

          <div className="space-y-4">
            {role === "developer" && (
              <>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FiCode className="w-5 h-5" />
                  Developer Features
                </h3>
                {developerFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FiCheck className={`w-5 h-5 flex-shrink-0 ${theme.checkColor}`} />
                    <span className={theme.accentLight}>{feature}</span>
                  </div>
                ))}
              </>
            )}
            {role === "business" && (
              <>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FiBriefcase className="w-5 h-5" />
                  Business Features
                </h3>
                {businessFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FiCheck className={`w-5 h-5 flex-shrink-0 ${theme.checkColor}`} />
                    <span className={theme.accentLight}>{feature}</span>
                  </div>
                ))}
              </>
            )}
            {role === "creator" && (
              <>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FiFeather className="w-5 h-5" />
                  Creator Features
                </h3>
                {creatorFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FiCheck className={`w-5 h-5 flex-shrink-0 ${theme.checkColor}`} />
                    <span className={theme.accentLight}>{feature}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/40 p-8 lg:p-10">
            {/* Role Tabs */}
            <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("developer")}
                className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  role === "developer"
                    ? "bg-white text-slate-800 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiCode className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Developer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("business")}
                className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  role === "business"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiBriefcase className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Business</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  role === "creator"
                    ? "bg-white text-pink-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiFeather className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Creator</span>
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
              <p className="text-gray-500">
                {role === "developer" && "Start building with our developer tools"}
                {role === "business" && "Start automating your business operations"}
                {role === "creator" && "Start growing your social media presence"}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-xl mb-6 text-sm shadow-lg shadow-red-100/50">
                  {error}
                </div>
              )}

              {role === "business" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 mb-6 space-y-4">
                  <h3 className="text-sm font-semibold text-blue-900">Business Profile</h3>
                  <p className="text-xs text-blue-700">
                    We collect these details to set up your business workspace correctly.
                  </p>

                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={businessProfile.fullName}
                      onChange={(e) => updateBusinessProfile("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      required={role === "business"}
                    />
                  </div>

                  <div>
                    <label className="label">Business Name</label>
                    <input
                      type="text"
                      className="input"
                      value={businessProfile.businessName}
                      onChange={(e) => updateBusinessProfile("businessName", e.target.value)}
                      placeholder="Debby Stores Ltd"
                      required={role === "business"}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Country</label>
                      <select
                        className="input"
                        value={businessProfile.country}
                        onChange={(e) => updateBusinessProfile("country", e.target.value)}
                        required={role === "business"}
                      >
                        <option value="">Select country</option>
                        {BUSINESS_COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        className="input"
                        value={businessProfile.phone}
                        onChange={(e) => updateBusinessProfile("phone", e.target.value)}
                        placeholder="+1 555 123 4567"
                        required={role === "business"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Industry</label>
                      <select
                        className="input"
                        value={businessProfile.industry}
                        onChange={(e) => updateBusinessProfile("industry", e.target.value)}
                        required={role === "business"}
                      >
                        <option value="">Select industry</option>
                        {BUSINESS_INDUSTRIES.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Team Size</label>
                      <select
                        className="input"
                        value={businessProfile.teamSize}
                        onChange={(e) => updateBusinessProfile("teamSize", e.target.value)}
                        required={role === "business"}
                      >
                        <option value="">Select team size</option>
                        {BUSINESS_TEAM_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Website (Optional)</label>
                    <input
                      type="url"
                      className="input"
                      value={businessProfile.website || ""}
                      onChange={(e) => updateBusinessProfile("website", e.target.value)}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
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
                  minLength={12}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Must be at least 12 characters
                </p>
              </div>

              <button
                type="submit"
                className={`w-full text-base py-4 mb-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  role === "developer"
                    ? "bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black shadow-slate-400/30"
                    : role === "creator"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-400/30"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-400/30"
                }`}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {role !== "business" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500">Or sign up with</span>
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
                    <span className="font-medium text-gray-700">
                      {oauthLoading === "google" ? "Connecting..." : "Sign up with Google"}
                    </span>
                  </button>

                  {role === "developer" && (
                    <button
                      type="button"
                      onClick={() => handleOAuth("github")}
                      disabled={!!oauthLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiGithub className="w-5 h-5 text-gray-900" />
                      <span className="font-medium text-gray-700">
                        {oauthLoading === "github" ? "Connecting..." : "Sign up with GitHub"}
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}

            {role === "business" && (
              <p className="text-xs text-center text-gray-500 mt-4">
                Business onboarding uses email signup so we can capture your profile details correctly.
              </p>
            )}

            <p className="text-center text-gray-500 mt-8">
              Already have an account?{" "}
              <Link to="/login" className={`font-semibold transition-colors ${
                role === "developer"
                  ? "text-slate-700 hover:text-slate-900"
                  : role === "creator"
                  ? "text-pink-600 hover:text-pink-700"
                  : "text-blue-600 hover:text-blue-700"
              }`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
