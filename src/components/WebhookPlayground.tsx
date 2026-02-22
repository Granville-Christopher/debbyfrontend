import React, { useState } from "react";
import { 
  FiPlay, FiCode, FiCopy, FiCheck, FiAlertCircle, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface TestResult {
  success: boolean;
  statusCode: number;
  statusText: string;
  responseBody: string;
  durationMs: number;
  requestDetails: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
  };
}

const samplePayloads = {
  "payment.completed": {
    id: "pay_1234567890",
    object: "payment",
    amount: 2500,
    currency: "usd",
    status: "completed",
    customer: {
      id: "cus_abc123",
      email: "customer@example.com"
    },
    created: Date.now()
  },
  "payment.failed": {
    id: "pay_1234567890",
    object: "payment",
    amount: 2500,
    currency: "usd",
    status: "failed",
    error: {
      code: "card_declined",
      message: "Your card was declined"
    },
    customer: {
      id: "cus_abc123",
      email: "customer@example.com"
    },
    created: Date.now()
  },
  "notification.sent": {
    id: "notif_1234567890",
    object: "notification",
    channel: "email",
    recipient: "user@example.com",
    status: "sent",
    delivered_at: Date.now()
  },
  "customer.created": {
    id: "cus_1234567890",
    object: "customer",
    email: "newcustomer@example.com",
    name: "John Doe",
    created: Date.now()
  }
};

export const WebhookPlayground: React.FC = () => {
  const { accessToken, csrfToken } = useAuth();
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("whsec_test_secret_key_12345");
  const [eventType, setEventType] = useState<keyof typeof samplePayloads>("payment.completed");
  const [payload, setPayload] = useState(JSON.stringify(samplePayloads["payment.completed"], null, 2));
  const [customHeaders, setCustomHeaders] = useState("{}");
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEventTypeChange = (type: keyof typeof samplePayloads) => {
    setEventType(type);
    setPayload(JSON.stringify(samplePayloads[type], null, 2));
  };

  const handleTest = async () => {
    if (!url) {
      setError("Please enter a webhook URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      let parsedPayload: any;
      let parsedHeaders: Record<string, string> = {};

      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        setError("Invalid payload JSON");
        setLoading(false);
        return;
      }

      try {
        parsedHeaders = JSON.parse(customHeaders);
      } catch {
        setError("Invalid headers JSON");
        setLoading(false);
        return;
      }

      const res = await apiRequest<TestResult>(
        "/developer/webhook-playground",
        {
          method: "POST",
          accessToken,
          csrfToken,
          body: {
            url,
            secret,
            eventType,
            payload: parsedPayload,
            headers: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined,
          },
        }
      );

      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setLoading(false);
    }
  };

  const copySignature = () => {
    if (result?.requestDetails?.headers?.["X-Webhook-Signature"]) {
      navigator.clipboard.writeText(result.requestDetails.headers["X-Webhook-Signature"]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourapp.com/webhook"
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Tip: Use <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">webhook.site</a> for testing
        </p>
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type
        </label>
        <select
          value={eventType}
          onChange={(e) => handleEventTypeChange(e.target.value as keyof typeof samplePayloads)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          {Object.keys(samplePayloads).map(type => (
            <option key={type} value={type} className="text-gray-900">{type}</option>
          ))}
        </select>
      </div>

      {/* Payload Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payload
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Advanced Options */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">Advanced Options</span>
          {showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        {showAdvanced && (
          <div className="p-4 space-y-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used to sign the webhook request
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Headers (JSON)
              </label>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                rows={3}
                placeholder='{"X-Custom-Header": "value"}'
                className="w-full px-4 py-2.5 bg-white font-mono text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={loading || !url}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <FiPlay className="w-5 h-5" />
            Send Test Webhook
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${result.success ? "text-green-700" : "text-red-700"}`}>
                {result.success ? "✓ Success" : "✗ Failed"}
              </span>
              <span className="text-sm text-gray-500">
                {result.durationMs}ms
              </span>
            </div>
            <p className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
              {result.statusCode} {result.statusText}
            </p>
          </div>

          {/* Request Details */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm font-medium text-gray-300">Request Details</span>
              <button
                onClick={copySignature}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Signature"}
              </button>
            </div>
            <div className="p-4 text-sm font-mono">
              <div className="text-blue-400">
                <span className="text-purple-400">POST</span> {result.requestDetails.url}
              </div>
              <div className="mt-3 text-gray-400">
                {Object.entries(result.requestDetails.headers).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-green-400">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Body */}
          {result.responseBody && (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-medium text-gray-300">Response Body</span>
              </div>
              <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">
                {result.responseBody}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
