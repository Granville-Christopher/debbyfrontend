import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiZap, 
  FiSettings, 
  FiShare2, 
  FiMonitor, 
  FiCheckCircle, 
  FiClock, 
  FiFilter, 
  FiShield, 
  FiTerminal, 
  FiDatabase
} from 'react-icons/fi';
import { Navbar } from '../components/Navbar';

const features = [
  {
    title: "Powerful Workflows",
    icon: <FiZap />,
    description: "Chain multiple platforms together. Create complex if/else logic and data transformations without a single line of code."
  },
  {
    title: "Enterprise Scheduling",
    icon: <FiClock />,
    description: "Multi-platform content queues with AI-optimized posting times. Maintain a consistent brand voice across $X$, $Threads$, and more."
  },
  {
    title: "Robust Webhooks",
    icon: <FiShare2 />,
    description: "Handle massive event volumes with intelligent retry logic, HMAC security, and real-time delivery tracking."
  },
  {
    title: "Live Monitoring",
    icon: <FiMonitor />,
    description: "Full observability into every automated action. Debug issues instantly with comprehensive event logs and dashboards."
  }
];

const capabilities = [
  { title: "Dynamic Filters", icon: <FiFilter />, desc: "Execute actions only when specific conditions are met in your data stream." },
  { title: "Secure Storage", icon: <FiShield />, desc: "Encrypted credential management for all your third-party API tokens." },
  { title: "Custom Scripts", icon: <FiTerminal />, desc: "Power users can inject custom JavaScript snippets for advanced data handling." },
  { title: "Data Sync", icon: <FiDatabase />, desc: "Automatic two-way synchronization between your connected business tools." }
];

export const Automations = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-20 text-gray-900 dark:text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black mb-8"
            >
              Master Your <br /> 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent italic">Workflows</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Don't just automate tasks—build an intelligent engine that runs your entire operation while you sleep.
            </motion.p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/30 transition-all shadow-sm"
              >
                <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <section className="mb-24 px-8 py-16 bg-gray-900 dark:bg-black rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black mb-8">Advanced Automation <br /> Capabilities</h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {capabilities.map((cap, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-purple-400 text-xl">{cap.icon}</span>
                        <h4 className="font-bold">{cap.title}</h4>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="aspect-square bg-[#0a1628] rounded-xl flex items-center justify-center border border-white/5 group">
                  <FiZap className="w-24 h-24 text-purple-500 animate-pulse group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          <footer className="text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Scale your operations today.</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-10 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20">
                Start For Free
              </Link>
              <Link to="/integrations" className="px-10 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                Explore Integrations
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
