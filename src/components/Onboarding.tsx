import React, { useState, useEffect } from "react";
import { FiX, FiChevronRight, FiChevronLeft, FiCheck, FiKey, FiLink, FiBell, FiCreditCard, FiUsers, FiSettings, FiCalendar, FiBarChart2 } from "react-icons/fi";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
  action?: string;
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
    title: "Welcome to DEBBY!",
    description: "Let's take a quick tour of your Business Dashboard. This will only take a minute.",
    icon: <FiCheck className="w-6 h-6" />,
  },
  {
    id: "integrations",
    title: "Connect Payment Gateway",
    description: "Connect Stripe or Paystack to start accepting payments from your customers.",
    icon: <FiCreditCard className="w-6 h-6" />,
    action: "integrations",
  },
  {
    id: "notifications",
    title: "Set Up Notifications",
    description: "Configure Email, SMS, or WhatsApp to send notifications to your customers.",
    icon: <FiBell className="w-6 h-6" />,
    action: "notifications",
  },
  {
    id: "customers",
    title: "Manage Customers",
    description: "Add and organize your customers. Create contact lists for targeted messaging.",
    icon: <FiUsers className="w-6 h-6" />,
    action: "customers",
  },
  {
    id: "payments",
    title: "Process Payments",
    description: "Queue payments and track their status in real-time. Set up recurring payments for subscriptions.",
    icon: <FiCreditCard className="w-6 h-6" />,
    action: "payments",
  },
  {
    id: "done",
    title: "You're All Set!",
    description: "You're ready to start growing your business. Check out our help center for more tips.",
    icon: <FiCheck className="w-6 h-6" />,
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
