import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusinessSignupProfile, useAuth } from "../auth/AuthProvider";
import { FiBriefcase, FiCheck, FiLock, FiShoppingBag, FiTrendingUp, FiUsers, FiZap } from "react-icons/fi";
import { ALL_COUNTRIES } from "../constants/countries";
import {
  PHONE_COUNTRY_CODES,
  combinePhoneNumber,
  getDialCodeForCountry
} from "../constants/phoneCountryCodes";

const BUSINESS_COUNTRIES = [...ALL_COUNTRIES];
const DEFAULT_PHONE_DIAL_CODE = "+1";

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

const BUSINESS_FEATURES = [
  "Storefront + checkout control",
  "Customer CRM and audience management",
  "Billing, subscriptions, and revenue tracking",
  "Automations for email/SMS/WhatsApp",
  "Integrations and operational intelligence"
];

export const BusinessSignup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessPhoneDialCode, setBusinessPhoneDialCode] = useState(DEFAULT_PHONE_DIAL_CODE);
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

  useEffect(() => {
    const dialCode = getDialCodeForCountry(businessProfile.country);
    if (dialCode) {
      setBusinessPhoneDialCode(dialCode);
    }
  }, [businessProfile.country]);

  const updateBusinessProfile = (field: keyof BusinessSignupProfile, value: string) => {
    setBusinessProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
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

      const fullPhone = combinePhoneNumber(businessPhoneDialCode, businessProfile.phone);
      if (!fullPhone) {
        setError("Phone number is required for business registration.");
        setLoading(false);
        return;
      }

      await signup(email, password, "business", {
        businessProfile: {
          ...businessProfile,
          fullName: businessProfile.fullName.trim(),
          businessName: businessProfile.businessName.trim(),
          country: businessProfile.country.trim(),
          phone: fullPhone,
          industry: businessProfile.industry.trim(),
          teamSize: businessProfile.teamSize.trim(),
          website: businessProfile.website?.trim() || undefined
        }
      });
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

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-start pt-4 pb-4 px-8 xl:px-12 text-white relative overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <Link to="/" className="text-4xl xl:text-5xl font-bold mb-5 inline-block hover:opacity-90 transition-opacity">
            DEBBY
          </Link>

          <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
            Start automating today
            <span className="block mt-2 text-blue-200">Built for serious business operations</span>
          </h1>

          <p className="text-lg text-blue-100 mb-6 leading-relaxed">
            Set up your business workspace and run storefront, CRM, payments, automations, and analytics from one platform.
          </p>

          <div className="space-y-3">
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" />
              Business Features
            </h3>
            {BUSINESS_FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <FiCheck className="w-5 h-5 flex-shrink-0 text-cyan-200" />
                <span className="text-blue-100 text-sm">{feature}</span>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-xl border border-blue-300/30 bg-blue-400/10 p-3">
                <FiShoppingBag className="w-4 h-4 text-cyan-200 mb-1.5" />
                <p className="text-xs text-blue-100">Storefront Control</p>
              </div>
              <div className="rounded-xl border border-blue-300/30 bg-blue-400/10 p-3">
                <FiUsers className="w-4 h-4 text-cyan-200 mb-1.5" />
                <p className="text-xs text-blue-100">CRM Visibility</p>
              </div>
              <div className="rounded-xl border border-blue-300/30 bg-blue-400/10 p-3">
                <FiTrendingUp className="w-4 h-4 text-cyan-200 mb-1.5" />
                <p className="text-xs text-blue-100">Revenue Intelligence</p>
              </div>
              <div className="rounded-xl border border-blue-300/30 bg-blue-400/10 p-3">
                <FiZap className="w-4 h-4 text-cyan-200 mb-1.5" />
                <p className="text-xs text-blue-100">Automation Engine</p>
              </div>
            </div>

            <div className="pt-1 flex items-start gap-3 text-blue-100">
              <FiLock className="w-4 h-4 mt-0.5 text-cyan-200" />
              <p className="text-xs">
                Business profile data is captured at signup for accurate billing currency and a 14-day Starter trial setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[58%] flex items-center justify-center p-0 md:p-6 lg:p-4">
        <div className="w-full md:max-w-[920px]">
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/40 p-4 md:p-6 lg:p-6">
            <div className="text-center mb-5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Create Business Account</h1>
              <p className="text-sm sm:text-base text-gray-500">Set up your Debby business workspace</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-xl mb-6 text-sm shadow-lg shadow-red-100/50">
                  {error}
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 md:p-3.5 mb-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-900">Business Profile</h3>
                <p className="text-xs text-blue-700">These details configure your business account and billing context.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={businessProfile.fullName}
                      onChange={(e) => updateBusinessProfile("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      required
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
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Country</label>
                    <select
                      className="input"
                      value={businessProfile.country}
                      onChange={(e) => updateBusinessProfile("country", e.target.value)}
                      required
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
                    <div className="flex flex-col xl:flex-row gap-2">
                      <select
                        className="input w-full xl:w-44 xl:shrink-0"
                        value={businessPhoneDialCode}
                        onChange={(e) => setBusinessPhoneDialCode(e.target.value)}
                        aria-label="Phone country code"
                      >
                        {PHONE_COUNTRY_CODES.map((entry) => (
                          <option key={`${entry.country}-${entry.dialCode}`} value={entry.dialCode}>
                            {entry.country} ({entry.dialCode})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="input flex-1"
                        value={businessProfile.phone}
                        onChange={(e) => updateBusinessProfile("phone", e.target.value)}
                        placeholder="8012345678"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Industry</label>
                    <select
                      className="input"
                      value={businessProfile.industry}
                      onChange={(e) => updateBusinessProfile("industry", e.target.value)}
                      required
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
                      required
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-3 mb-4">
                <div>
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
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    minLength={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">Min 12 characters</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-sm sm:text-base py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-400/30"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm sm:text-base text-gray-500 mt-5">
              Already have an account?{" "}
              <Link to="/business/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
