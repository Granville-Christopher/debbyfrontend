import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiLock, FiGlobe } from 'react-icons/fi';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a1628]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
            <FiArrowLeft /> Back to Home
          </Link>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-wider">DEBBY</span>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-blue dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
                <FiShield size={32} />
              </div>
              <h1 className="text-4xl font-black mb-0">Privacy Policy</h1>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-12">
              At DEBBY, we are committed to protecting your privacy. This policy outlines how we handle your data with the highest standards of security and transparency.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16 not-prose">
              <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-gray-700">
                <FiLock className="text-blue-500 mb-4" size={24} />
                <h3 className="font-bold mb-2">Data Protection</h3>
                <p className="text-sm text-gray-500">We use AES-256 encryption at rest and TLS 1.3 for all data in transit.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-gray-700">
                <FiGlobe className="text-blue-500 mb-4" size={24} />
                <h3 className="font-bold mb-2">Global Compliance</h3>
                <p className="text-sm text-gray-500">GDPR, CCPA, and NDPR compliant data processing practices.</p>
              </div>
            </div>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. Data We Collect</h2>
              <p>We collect information necessary to provide our automation and billing services:</p>
              <ul>
                <li><strong>Account Credentials:</strong> Email, name, and encrypted passwords.</li>
                <li><strong>Service Data:</strong> Tokens and metadata for platform integrations ($X$, $GitHub$, $Threads$, etc.).</li>
                <li><strong>Financial Data:</strong> We do not store credit card numbers; all payments are processed securely via <strong>Stripe</strong> or <strong>Paystack</strong>.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. Third-Party Integrations</h2>
              <p>DEBBY connects to various third-party services. When you authorize an integration, we only access the data required for the specific automation workflows you have configured. We do not sell your data to third parties.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. Data Retention</h2>
              <p>We retain your personal information for as long as your account is active. Upon account deletion, all personal data is purged from our production databases within 30 days, except where required by law.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">4. Security Measures</h2>
              <p>Our infrastructure is hosted on secure, SOC 2 compliant servers. We conduct regular security audits and vulnerability assessments to ensure your data remains protected against unauthorized access.</p>
            </section>

            <hr className="border-gray-200 dark:border-gray-800 my-12" />

            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">Questions or Concerns?</h2>
              <p>If you have any questions about this policy or our data practices, please reach out to our privacy officer at <strong>privacy@debby.io</strong>.</p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
