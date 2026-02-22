import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiCheckCircle, FiInfo } from 'react-icons/fi';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a1628]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            <FiArrowLeft /> Back to Home
          </Link>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">DEBBY</span>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-indigo dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <FiFileText size={32} />
              </div>
              <h1 className="text-4xl font-black mb-0">Terms of Service</h1>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-12">
              Please read these terms carefully. By using DEBBY, you are agreeing to the terms that govern our platform and services.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 mb-12 not-prose flex items-start gap-4">
               <FiInfo className="text-blue-500 mt-1 flex-shrink-0" size={20} />
               <p className="text-sm text-blue-800 dark:text-blue-300">
                 <strong>Simplified:</strong> We provide a platform for automation and billing. You own your data, but you must use the service legally and pay for your chosen plan.
               </p>
            </div>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. The Agreement</h2>
              <p>These Terms of Service constitute a legally binding agreement between you and DEBBY. By accessing our platform through any device, you acknowledge that you have read, understood, and agreed to be bound by these terms.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. Subscription and Billing</h2>
              <p>DEBBY operates on a subscription-based model. By selecting a plan, you agree to the following:</p>
              <ul>
                <li><strong>Automatic Renewal:</strong> Plans renew automatically at the end of each billing cycle unless cancelled.</li>
                <li><strong>Fees:</strong> All fees are exclusive of taxes. You are responsible for all applicable taxes.</li>
                <li><strong>Refunds:</strong> Subscriptions are generally non-refundable, but we may offer credits at our sole discretion.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. Prohibited Use</h2>
              <p>You may not use DEBBY to:</p>
              <ul>
                <li>Engage in any illegal activity or promote illegal acts.</li>
                <li>Attempt to bypass our security measures or rate limits.</li>
                <li>Scrape, crawl, or spider any part of the service without authorization.</li>
                <li>Post or transmit spam, phishing content, or malware.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
              <p>DEBBY and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You retain all rights to the data you process through our platform.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p>DEBBY is provided "as is" without warranty of any kind. We shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.</p>
            </section>

            <hr className="border-gray-200 dark:border-gray-800 my-12" />

            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-8">
              <FiCheckCircle /> <span>Agreed to terms as of {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
