import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import TrustStrip from "../components/landing/TrustStrip";
import OperationsStream from "../components/landing/OperationsStream";
import ToolsReplaced from "../components/landing/ToolsReplaced";
import FeatureGrid from "../components/landing/FeatureGrid";
import RevenueIntelligence from "../components/landing/RevenueIntelligence";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export const BusinessHome = () => {
  return (
    <div className="business-homepage min-h-screen bg-slate-50 text-slate-900 dark:bg-[#071329] dark:text-slate-100">
      <Header />
      <Hero />
      <TrustStrip />
      <OperationsStream />
      <ToolsReplaced />
      <FeatureGrid />
      <RevenueIntelligence />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
};

