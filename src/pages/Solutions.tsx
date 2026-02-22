import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCode, 
  FiBriefcase, 
  FiUser, 
  FiArrowRight, 
  FiCheck, 
  FiServer, 
  FiUsers, 
  FiBarChart2 
} from 'react-icons/fi';
import { Navbar } from '../components/Navbar';

const solutions = [
  {
    role: "Developers",
    id: "developer",
    icon: <FiCode className="w-12 h-12 text-blue-500" />,
    title: "Engineered for Builders",
    description: "Built for speed and control. Manage tokens, test webhooks, and automate your local development environment with our robust CLI and API.",
    highlights: [
      { title: "API Control", icon: <FiServer />, desc: "Granular control over API keys and environment variables." },
      { title: "Webhook Testing", icon: <FiCode />, desc: "Integrated playground to simulate and debug webhook events." }
    ],
    features: ["Native CLI Tooling", "Webhook Delivery Logs", "Rate Limit Management", "Custom API Keys", "HMAC Security"]
  },
  {
    role: "Businesses",
    id: "business",
    icon: <FiBriefcase className="w-12 h-12 text-indigo-600" />,
    title: "Unified Business Operations",
    description: "Scale your revenue without scaling your team. Automate recurring billing, customer data sync, and multi-channel notifications across $Stripe$ and $Paystack$.",
    highlights: [
      { title: "Revenue Ops", icon: <FiBarChart2 />, desc: "Real-time revenue tracking and automated invoicing." },
      { title: "Customer CRM", icon: <FiUsers />, desc: "Centralized hub for all your customer interactions and history." }
    ],
    features: ["Payment Logic Automation", "Paystack & Stripe Sync", "Team Collaboration", "Global Invoicing", "Fraud Protection"]
  },
  {
    role: "Creators",
    id: "creator",
    icon: <FiUser className="w-12 h-12 text-pink-500" />,
    title: "Scale Your Influence",
    description: "Focus on creating while we handle the distribution. Schedule posts, track deep analytics, and grow your audience across X, Threads, and more.",
    highlights: [
      { title: "Smart Scheduling", icon: <FiCheck />, desc: "AI-optimized queue for maximum engagement." },
      { title: "Growth Analytics", icon: <FiBarChart2 />, desc: "Track followers and engagement across multiple platforms." }
    ],
    features: ["Multi-platform Planner", "Audience Insights", "Visual Content Calendar", "Hashtag Manager", "Auto-fallback Posting"]
  }
];

export const Solutions = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-4 text-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black mb-8"
            >
              The <span className="text-blue-600 dark:text-blue-400">Right Choice</span> <br /> For Every Builder
            </motion.h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're writing code, running a company, or building a brand, DEBBY has the tools you need to succeed.
            </p>
          </header>

          <div className="space-y-32">
            {solutions.map((sol, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="mb-6 inline-block p-4 bg-gray-50 dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    {sol.icon}
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Platform for {sol.role}</h2>
                  <h3 className="text-4xl font-bold mb-6 leading-tight">{sol.title}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {sol.description}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-6 mb-10">
                    {sol.highlights.map((h, i) => (
                      <div key={i} className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-blue-500 text-xl mb-3 block">{h.icon}</span>
                        <h4 className="font-bold mb-1">{h.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{h.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-10">
                    {sol.features.map((f, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-900/30">
                        {f}
                      </span>
                    ))}
                  </div>

                  <Link to={`/signup?role=${sol.role.toLowerCase()}`} className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:gap-4 shadow-xl shadow-blue-600/20">
                    Get Started for {sol.role} <FiArrowRight />
                  </Link>
                </div>

                <div className={`relative ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px]" />
                  <div className="relative aspect-square bg-gray-50 dark:bg-white/5 rounded-[40px] border border-gray-200 dark:border-gray-700 p-12 overflow-hidden shadow-Inner">
                    <div className="w-full h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl opacity-40">
                      <span className="text-8xl font-black font-logo opacity-20">DEBBY</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          <section className="mt-40 p-16 bg-gray-900 dark:bg-black rounded-3xl text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:40px_40px]" />
             <div className="relative z-10">
               <h2 className="text-4xl font-black mb-8 italic">Ready to transform your workflow?</h2>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Link to="/signup" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all">
                   Join 10,000+ Teams
                 </Link>
                 <Link to="/integrations" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-lg transition-all">
                   View Integrations
                 </Link>
               </div>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};
