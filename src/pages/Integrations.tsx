import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiTwitter, 
  FiGithub, 
  FiCreditCard, 
  FiMessageSquare, 
  FiExternalLink, 
  FiAtSign, 
  FiMail, 
  FiPhone, 
  FiMessageCircle, 
  FiDollarSign 
} from 'react-icons/fi';
import { Navbar } from '../components/Navbar';

const integrationList = [
  {
    name: "X (Twitter)",
    icon: <FiTwitter className="w-8 h-8 text-blue-400" />,
    description: "Fully automated posting, scheduling, and analytics for X accounts. Reach your audience when they are most active.",
    status: "Native Support"
  },
  {
    name: "Threads",
    icon: <FiAtSign className="w-8 h-8 text-pink-500" />,
    description: "Seamlessly schedule and auto-post to Threads. Keep your presence consistent across the Meta ecosystem.",
    status: "Native Support"
  },
  {
    name: "GitHub",
    icon: <FiGithub className="w-8 h-8 text-gray-800 dark:text-gray-200" />,
    description: "Connect your repositories to trigger automated workflows, monitor deployments, and manage webhooks.",
    status: "Official Integration"
  },
  {
    name: "Stripe",
    icon: <FiCreditCard className="w-8 h-8 text-indigo-500" />,
    description: "The global gold standard for payments. Automate recurring billing, checkout flows, and customer management.",
    status: "Enterprise"
  },
  {
    name: "Paystack",
    icon: <FiDollarSign className="w-8 h-8 text-blue-500" />,
    description: "Accelerate your growth in Africa with seamless Paystack integration for modern online payments.",
    status: "Enterprise"
  },
  {
    name: "SendGrid",
    icon: <FiMail className="w-8 h-8 text-blue-600" />,
    description: "Reliable transactional email delivery. Automate customer notifications and marketing campaigns with ease.",
    status: "Official"
  },
  {
    name: "Twilio",
    icon: <FiPhone className="w-8 h-8 text-red-500" />,
    description: "Build powerful SMS and voice capabilities into your workflows. Reach customers directly on their mobile devices.",
    status: "Official"
  },
  {
    name: "WhatsApp",
    icon: <FiMessageCircle className="w-8 h-8 text-green-500" />,
    description: "Engage your customers on the world's most popular messaging app with automated WhatsApp triggers.",
    status: "Official"
  },
  {
    name: "Discord",
    icon: <FiMessageSquare className="w-8 h-8 text-indigo-400" />,
    description: "Send automated notifications and alerts directly to your team servers or community channels.",
    status: "Available"
  }
];

export const Integrations = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6"
            >
              Powering Your <span className="text-blue-600 dark:text-blue-400">Tech Stack</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Connect DEBBY with the tools you already use. We provide native support for all major platforms, ensuring your data syncs perfectly every time.
            </motion.p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationList.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-white dark:bg-[#0a1628] rounded-2xl shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed flex-grow">
                  {item.description}
                </p>
                <Link to="/signup" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:gap-3 transition-all">
                  Set up integration <FiExternalLink />
                </Link>
              </motion.div>
            ))}
          </div>

          <section className="mt-20 p-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl text-white">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-black mb-4">Enterprise Custom Built?</h2>
              <p className="text-blue-100 mb-8 text-lg">We offer custom integration services for large organizations. If you have unique requirements or proprietary internal tools, our engineering team can build dedicated connectors for your stack.</p>
              <div className="flex gap-4">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                  Contact Sales
                </button>
                <button className="bg-blue-500/20 text-white border border-blue-400/30 px-8 py-3 rounded-xl font-bold hover:bg-blue-500/30 transition-all">
                  Documentation
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
