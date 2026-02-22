import React, { useState } from "react";
import { FiMail, FiSend, FiCheck } from "react-icons/fi";
import { toast } from "./Toast";

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Thanks for subscribing! Check your email for confirmation.");
      setEmail("");
      
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-8 shadow-xl">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex p-3 bg-white/20 dark:bg-white/10 rounded-full mb-4">
          <FiMail className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
        <p className="text-blue-100 dark:text-blue-200 mb-6">
          Get the latest updates, tips, and exclusive content delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
              required
              disabled={isSubmitting || isSubmitted}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitted ? (
              <>
                <FiCheck className="w-5 h-5" />
                Subscribed!
              </>
            ) : isSubmitting ? (
              "Subscribing..."
            ) : (
              <>
                <FiSend className="w-5 h-5" />
                Subscribe
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-blue-100 dark:text-blue-200 mt-4 opacity-75">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};
