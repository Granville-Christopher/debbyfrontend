import React, { useState } from "react";
import { Modal } from "./Modal";
import { FiShield, FiCopy, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isOpen, onClose, onSuccess }) => {
  const { accessToken, csrfToken } = useAuth();
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ otpauthUrl: string; backupCodes: string[] }>(
        "/security/2fa/setup",
        { method: "POST", accessToken, csrfToken }
      );
      setOtpauthUrl(response.otpauthUrl);
      setBackupCodes(response.backupCodes);
      setStep("verify");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/security/2fa/verify", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { token: verificationCode },
      });
      setStep("backup");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
    setStep("setup");
    setOtpauthUrl("");
    setBackupCodes([]);
    setVerificationCode("");
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <FiShield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
        <p className="text-gray-600 text-sm">
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>
      </div>
      
      <div className="bg-blue-50/70 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">You'll need:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
          <li>• Your phone to scan the QR code</li>
        </ul>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50/70 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSetup}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Setting up..." : "Continue"}
      </button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
        <p className="text-gray-600 text-sm mb-4">
          Scan this QR code with your authenticator app
        </p>
        
        {/* QR Code - using a simple QR code library or API */}
        <div className="bg-white p-4 rounded-lg inline-block shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
            alt="2FA QR Code"
            className="w-48 h-48"
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Can't scan? Enter this code manually in your app:
        </p>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all block mt-1">
          {otpauthUrl.split("secret=")[1]?.split("&")[0] || ""}
        </code>
      </div>
      
      <div>
        <label className="label">Enter verification code</label>
        <input
          type="text"
          className="input text-center text-2xl tracking-widest"
          maxLength={6}
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      
      {error && (
        <div className="p-3 bg-red-50/70 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={() => setStep("setup")}
          className="btn btn-secondary flex-1"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
          className="btn btn-primary flex-1"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA Enabled!</h3>
        <p className="text-gray-600 text-sm">
          Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
        </p>
      </div>
      
      <div className="bg-yellow-50/70 rounded-lg p-4 flex items-start gap-3">
        <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Each backup code can only be used once. Store them securely.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-gray-700">Backup Codes</span>
          <button
            onClick={copyBackupCodes}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            {copiedBackup ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            {copiedBackup ? "Copied!" : "Copy all"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <code key={index} className="bg-white px-3 py-2 rounded text-center font-mono text-sm">
              {code}
            </code>
          ))}
        </div>
      </div>
      
      <button onClick={handleComplete} className="btn btn-primary w-full">
        Done
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "backup" ? handleComplete : onClose}
      title="Two-Factor Authentication"
      size="md"
    >
      {step === "setup" && renderSetupStep()}
      {step === "verify" && renderVerifyStep()}
      {step === "backup" && renderBackupStep()}
    </Modal>
  );
};

// Disable 2FA Modal
interface Disable2FAProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const Disable2FA: React.FC<Disable2FAProps> = ({ isOpen, onClose, onSuccess }) => {
  const { accessToken, csrfToken } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/security/2fa/disable", {
        method: "POST",
        accessToken,
        csrfToken,
        body: { password },
      });
      onSuccess();
      onClose();
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disable Two-Factor Authentication"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleDisable}
            className="btn btn-danger"
            disabled={loading || !password}
          >
            {loading ? "Disabling..." : "Disable 2FA"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-yellow-50/70 rounded-lg p-4 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Disabling 2FA will make your account less secure. Are you sure?
          </p>
        </div>
        
        <div>
          <label className="label">Enter your password to confirm</label>
          <input
            type="password"
            className="input"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="p-3 bg-red-50/70 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};
