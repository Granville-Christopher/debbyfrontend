import React, { useState, useEffect } from "react";
import { FiX, FiChevronRight, FiChevronLeft, FiCheck, FiKey, FiLink, FiBell, FiCreditCard, FiUsers, FiSettings, FiCalendar, FiBarChart2 } from "react-icons/fi";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  action?: string;
  details?: string[];
}

const developerSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to DEBBY!",
    description: "Let's take a quick tour of your Developer Dashboard. This will only take a minute.",
    icon: <FiCheck className="w-6 h-6" />,
  },
  {
    id: "api-keys",
    title: "Create API Keys",
    description: "Generate API keys to authenticate your requests. Click 'Create API Key' to get started.",
    icon: <FiKey className="w-6 h-6" />,
    action: "api-keys",
  },
  {
    id: "webhooks",
    title: "Set Up Webhooks",
    description: "Configure webhook endpoints to receive real-time event notifications from your integrations.",
    icon: <FiLink className="w-6 h-6" />,
    action: "webhooks",
  },
  {
    id: "integrations",
    title: "Connect Integrations",
    description: "Link your Stripe, Paystack, or GitHub accounts to start processing payments and events.",
    icon: <FiSettings className="w-6 h-6" />,
    action: "integrations",
  },
  {
    id: "events",
    title: "Monitor Events",
    description: "Track all events in real-time. You can search, filter, and replay failed deliveries.",
    icon: <FiBell className="w-6 h-6" />,
    action: "events",
  },
  {
    id: "done",
    title: "You're All Set!",
    description: "You're ready to start building. Check out our documentation for detailed guides.",
    icon: <FiCheck className="w-6 h-6" />,
  },
];

const businessSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Debby for Business",
    description: "This is your commerce control tower. In a few steps, you will connect payments, automate customer communication, and launch your storefront.",
    icon: <FiCheck className="w-6 h-6" />,
    details: [
      "Your first 14 days are a free trial.",
      "After trial, Billing stays open so you can pick Starter, Growth, or Scale.",
      "Most tabs can stay visible, but locked features will prompt upgrade."
    ]
  },
  {
    id: "billing",
    title: "Confirm Your Plan and Billing",
    description: "Open Billing to review your plan access, limits, and transaction fee policy.",
    icon: <FiCreditCard className="w-6 h-6" />,
    action: "billing",
    details: [
      "Nigeria accounts are billed in NGN; other countries are billed in USD.",
      "Growth and Scale use platform transaction fees; Starter stays subscription-only.",
      "You can always upgrade from Billing."
    ]
  },
  {
    id: "integrations",
    title: "Connect Payment Gateway",
    description: "Connect Stripe or Paystack so customers can pay at checkout and your payment data syncs into Debby.",
    icon: <FiCreditCard className="w-6 h-6" />,
    action: "integrations",
    details: [
      "For paid tiers, use split-capable gateway setup so platform fees are captured correctly.",
      "If a gateway is not fully connected, checkout operations can be restricted."
    ]
  },
  {
    id: "shop",
    title: "Set Up Your Shop",
    description: "Create your shop details, add products, and choose your checkout mode.",
    icon: <FiSettings className="w-6 h-6" />,
    action: "shop",
    details: [
      "WhatsApp order completion is only available where your plan allows it.",
      "You can update shop setup later from Shop and Settings."
    ]
  },
  {
    id: "notifications",
    title: "Enable Customer Notifications",
    description: "Configure Email, SMS, and WhatsApp channels so Debby can send reminders, updates, and automation messages.",
    icon: <FiBell className="w-6 h-6" />,
    action: "notifications",
    details: [
      "You control your own provider credentials.",
      "Debby orchestrates delivery status, retries, and reporting in one place."
    ]
  },
  {
    id: "customers",
    title: "Manage Customers",
    description: "Keep customer profiles, contact details, and segments organized for targeted engagement.",
    icon: <FiUsers className="w-6 h-6" />,
    action: "customers",
  },
  {
    id: "ops",
    title: "Operate and Monitor at Scale",
    description: "Use Ops and Intelligence to monitor workflows, run recovery actions, and spot risk early.",
    icon: <FiBarChart2 className="w-6 h-6" />,
    action: "intelligence",
    details: [
      "Track risk, alerts, and retention workflows.",
      "Run workflow actions and audit ops health from one dashboard."
    ]
  },
  {
    id: "done",
    title: "You're All Set!",
    description: "You can reopen this onboarding tour anytime from Settings.",
    icon: <FiCheck className="w-6 h-6" />,
    details: [
      "Next best step: complete Billing and Integrations first.",
      "Then configure Shop + Notifications before driving traffic."
    ]
  },
];

const creatorSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to DEBBY!",
    description: "Let's take a quick tour of your Creator Dashboard. This will only take a minute.",
    icon: <FiCheck className="w-6 h-6" />,
  },
  {
    id: "accounts",
    title: "Connect Social Accounts",
    description: "Link your X (Twitter) and Threads accounts to start posting and managing your content.",
    icon: <FiLink className="w-6 h-6" />,
    action: "accounts",
  },
  {
    id: "posts",
    title: "Schedule Posts",
    description: "Create and schedule posts for your social media accounts. Use our AI templates to get started.",
    icon: <FiCalendar className="w-6 h-6" />,
    action: "scheduler",
  },
  {
    id: "templates",
    title: "Use AI Templates",
    description: "Generate engaging content with our AI-powered templates. Customize them for your brand.",
    icon: <FiSettings className="w-6 h-6" />,
    action: "templates",
  },
  {
    id: "analytics",
    title: "Track Performance",
    description: "Monitor your social media growth, engagement, and post performance in real-time.",
    icon: <FiBarChart2 className="w-6 h-6" />,
    action: "analytics",
  },
  {
    id: "done",
    title: "You're All Set!",
    description: "You're ready to grow your audience and engage with your followers. Start creating amazing content!",
    icon: <FiCheck className="w-6 h-6" />,
  },
];

interface OnboardingProps {
  role: "developer" | "business" | "creator";
  onComplete: () => void;
  onNavigate?: (tab: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ role, onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const steps = role === "developer" ? developerSteps : role === "creator" ? creatorSteps : businessSteps;
  const step = steps[currentStep];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (steps[currentStep + 1].action && onNavigate) {
        onNavigate(steps[currentStep + 1].action!);
      }
    } else {
      handleComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (steps[currentStep - 1].action && onNavigate) {
        onNavigate(steps[currentStep - 1].action!);
      }
    }
  };
  
  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(`onboarding_${role}_completed`, "true");
    onComplete();
  };
  
  const handleSkip = () => {
    handleComplete();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            {step.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {step.title}
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            {step.description}
          </p>

          {Array.isArray(step.details) && step.details.length > 0 && (
            <div className="mb-8 mx-auto max-w-md rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-left">
              <ul className="space-y-1.5 text-sm text-blue-900">
                {step.details.map((detail, idx) => (
                  <li key={`${step.id}-detail-${idx}`} className="flex gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? "w-6 bg-blue-500" 
                    : index < currentStep 
                      ? "bg-blue-300" 
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/70 border-t border-gray-200/50">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex gap-3">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Skip Tour
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <FiCheck className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <FiChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check if onboarding should be shown
export const useOnboarding = (role: "developer" | "business" | "creator") => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    const completed = localStorage.getItem(`onboarding_${role}_completed`);
    if (!completed) {
      // Delay showing onboarding to let the page load
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [role]);
  
  const resetOnboarding = () => {
    localStorage.removeItem(`onboarding_${role}_completed`);
    setShowOnboarding(true);
  };
  
  return { showOnboarding, setShowOnboarding, resetOnboarding };
};
