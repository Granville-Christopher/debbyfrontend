import React, { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export const OAuthCallback = () => {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        console.error("Missing code or state in OAuth callback");
        navigate("/login?error=oauth_failed");
        return;
      }

      try {
        // Call backend to complete OAuth
        const response = await fetch(`https://debby-backend-production.up.railway.app/api/oauth/${provider}/callback?code=${code}&state=${state}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          // Refresh auth state and redirect
          await refresh();
          navigate("/", { replace: true });
        } else {
          const error = await response.json().catch(() => ({}));
          console.error("OAuth callback failed:", error);
          navigate("/login?error=oauth_failed");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/login?error=oauth_failed");
      }
    };

    handleCallback();
  }, [provider, searchParams, navigate, refresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing {provider} Sign In...
        </h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
};
