import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCheck, 
  FiZap, 
  FiClock, 
  FiShield, 
  FiBarChart2, 
  FiUsers, 
  FiServer, 
  FiCreditCard, 
  FiMail, 
  FiPhone, 
  FiMessageCircle, 
  FiStar,
  FiTwitter,
  FiAtSign
} from 'react-icons/fi';
import { Navbar } from '../components/Navbar';

const pricingPlans = {
  creator: [
    { title: "Free", price: "0", features: ["1 Social Account", "10 scheduled posts/month", "Basic scheduling"], cta: "Start Free", gradient: "from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" },
    { title: "Starter", price: "9", features: ["3 Social Accounts", "100 scheduled posts/month", "Advanced scheduling", "Priority support"], cta: "Get Starter", popular: true, gradient: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20" },
    { title: "Pro", price: "29", features: ["10 Social Accounts", "500 posts/month", "Detailed analytics", "Team collaboration"], cta: "Get Pro", gradient: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20" },
    { title: "Enterprise", price: "99", features: ["Unlimited accounts", "Unlimited posts", "Custom analytics", "Dedicated support"], cta: "Contact Sales", gradient: "from-gray-800 to-gray-900 dark:from-black dark:to-gray-900", dark: true }
  ],
  developer: [
    { title: "Free", price: "0", features: ["1 API key", "100 API calls/month", "5 webhooks", "Email support"], cta: "Start Free", gradient: "from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" },
    { title: "Starter", price: "19", features: ["5 API keys", "5,000 API calls/month", "25 webhooks", "5 team members"], cta: "Get Starter", popular: true, gradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" },
    { title: "Professional", price: "79", features: ["20 API keys", "50,000 API calls/month", "100 webhooks", "20 team members"], cta: "Get Professional", gradient: "from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" },
    { title: "Enterprise", price: "249", features: ["Unlimited API keys", "Unlimited API calls", "Unlimited webhooks", "SLA guarantee"], cta: "Contact Sales", gradient: "from-gray-700 to-gray-900 dark:from-gray-800 dark:to-slate-900", dark: true }
  ],
  business: [
    { title: "Free", price: "0", features: ["10 notifications/day", "50 customers", "Basic payments", "Email support"], cta: "Start Free", gradient: "from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" },
    { title: "Starter", price: "29", features: ["500 notifications/day", "500 customers", "Email, SMS & WhatsApp", "5 team members"], cta: "Get Starter", popular: true, gradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" },
    { title: "Professional", price: "99", features: ["5,000 notifications/day", "5,000 customers", "Advanced CRM", "20 team members"], cta: "Get Professional", gradient: "from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" },
    { title: "Enterprise", price: "299", features: ["Unlimited notifications", "Unlimited customers", "White-label options", "SLA guarantee"], cta: "Contact Sales", gradient: "from-purple-800 to-indigo-800 dark:from-purple-900 dark:to-indigo-900", dark: true }
  ]
};

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6"
            >
              Simple, <span className="text-blue-600 dark:text-blue-400">Transparent</span> Pricing
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Choose the plan that's right for you. Whether you're a developer, business, or creator, we have you covered.
            </motion.p>
          </header>

          <div className="space-y-32">
            {Object.entries(pricingPlans).map(([type, plans], sectionIdx) => (
              <section key={type} className="scroll-mt-32">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 capitalize">For {type}s</h2>
                  <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-gradient-to-br ${plan.gradient} p-8 rounded-[32px] border ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200 dark:border-gray-700'} flex flex-col h-full transition-all hover:-translate-y-2`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                          Most Popular
                        </div>
                      )}
                      <div className="mb-8">
                        <h3 className={`text-xl font-bold mb-2 ${plan.dark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.title}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${plan.dark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>${plan.price}</span>
                          <span className={`${plan.dark ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>/month</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <FiCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.dark ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}`} />
                            <span className={`text-sm ${plan.dark ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link 
                        to="/signup" 
                        className={`block text-center py-4 rounded-2xl font-bold transition-all ${
                          plan.dark 
                            ? 'bg-white text-gray-900 hover:bg-gray-100' 
                            : plan.popular 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' 
                              : 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-40 p-12 bg-gray-50 dark:bg-white/5 rounded-[40px] border border-gray-200 dark:border-gray-700">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Need more information? Here are some common questions about our plans and features.</p>
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Contact our support team</Link>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-[#0a1628] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Can I switch plans later?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Yes, you can upgrade or downgrade your plan at any time from your dashboard settings.</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#0a1628] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Is there a free trial?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All paid plans come with a 14-day free trial. No credit card required to start.</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#0a1628] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Do you offer yearly discounts?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Yes, pay annually and save 20% on any paid plan.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 dark:bg-[#0a1628] py-20 px-4 text-white border-t border-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-8 italic">Ready to transform your workflow?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/signup" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                Join 10,000+ Teams
                </Link>
                <Link to="/integrations" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-lg transition-all">
                View Integrations
                </Link>
            </div>
            <p className="mt-12 text-gray-500">© 2026 DEBBY. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
