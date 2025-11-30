import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Truck, 
  Store, 
  ShieldCheck, 
  ScanLine, 
  ArrowRight, 
  Activity, 
  Lock, 
  Database,
  Search
} from 'lucide-react';

// --- Theme Configuration & Mock Data ---

const THEME = {
  colors: {
    bg: '#F2F0E9',      // Raw Linen
    surface: '#E6E4DC', // Warm Stone
    text: '#2E2C29',    // Warm Charcoal
    secondary: '#787570', // Stone Grey
    olive: '#6B705C',   // Dried Green
    clay: '#B07D62',    // Terracotta
    sand: '#DDBEA9',    // Pale Wood
  }
};

const STAGES = [
  { 
    id: 1, 
    title: 'Manufacturer', 
    icon: Box, 
    desc: 'Product created and logged on-chain.',
    hash: '0x71C...9A2' 
  },
  { 
    id: 2, 
    title: 'Warehouse', 
    icon: Truck, 
    desc: 'In-transit status updated via QR scan.',
    hash: '0x3B9...C1D' 
  },
  { 
    id: 3, 
    title: 'Retailer', 
    icon: Store, 
    desc: 'Final destination verified and stocked.',
    hash: '0x9E2...F41' 
  }
];

// --- Animation Variants (Weighted & Smooth) ---

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } // Custom bezier for weight
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage = () => {
  
  // Navigation Handler
  const handleDashboardClick = () => {
    // TODO: Connect this to your Router (e.g., navigate('/dashboard'))
    console.log("Navigating to Dashboard...");
    window.location.href = '/dashboard'; // Simple fallback
  };

  return (
    <div 
      className="min-h-screen w-full selection:bg-[#DDBEA9] selection:text-[#2E2C29] overflow-x-hidden"
      style={{ backgroundColor: THEME.colors.bg, color: THEME.colors.text }}
    >
      {/* NOTE: Ensure these fonts are loaded in your index.css or Layout 
        font-poppins, font-source-serif, font-cursive, font-montserrat
      */}

      {/* --- Navigation Bar --- */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Box strokeWidth={1.5} className="w-6 h-6" style={{ color: THEME.colors.olive }} />
          <span className="font-source-serif font-bold text-lg tracking-tight">SupplyOnChain</span>
        </div>
        <button 
          onClick={handleDashboardClick}
          className="font-montserrat text-sm font-medium hover:opacity-70 transition-opacity"
        >
          Begin?
        </button>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-4 flex justify-center">
            <span 
              className="px-4 py-1.5 rounded-full text-xs font-montserrat tracking-widest uppercase border"
              style={{ borderColor: THEME.colors.olive, color: THEME.colors.olive }}
            >
              Ethereum Powered Supply Chain
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="font-poppins font-bold text-5xl md:text-7xl leading-[1.1] mb-8"
          >
            From <span style={{ color: THEME.colors.clay }}>Source</span> to <span style={{ color: THEME.colors.olive }}>Shelf</span>. <br />
            <span className="font-cursive font-normal opacity-80 block mt-2 text-4xl md:text-6xl">
              Immutably Recorded.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="font-source-serif text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: THEME.colors.secondary }}
          >
            A transparent journey for every product. We utilize smart contracts to create 
            tamper-proof audit trails, ensuring authenticity from the manufacturer to the end consumer.
          </motion.p>

          <motion.button
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDashboardClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 text-white rounded-lg overflow-hidden transition-all shadow-lg"
            style={{ backgroundColor: THEME.colors.text }}
          >
            <span className="font-poppins font-medium relative z-10">Explore Dashboard</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </motion.div>
      </section>

      {/* --- Dashboard Preview / How It Works --- */}
      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm border-y border-[#DDBEA9]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
              Real-time Visibility. <br/>
              <span className="font-cursive text-3xl text-[#B07D62]">Zero Trust Required.</span>
            </h2>
            <p className="font-source-serif text-lg text-[#787570] mb-8">
              Scan QR codes at every checkpoint. The data is pushed directly to the Ethereum blockchain, 
              updating the dashboard instantly for all stakeholders.
            </p>

            <div className="space-y-6">
              {[
                { icon: ScanLine, title: "QR Scanning", text: "Physical to Digital bridge." },
                { icon: Database, title: "Smart Contracts", text: "Auto-executing logic." },
                { icon: Lock, title: "Immutable Record", text: "Permanent history." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-[#E6E4DC]">
                    <item.icon strokeWidth={1} className="w-5 h-5 text-[#2E2C29]" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-[#2E2C29]">{item.title}</h4>
                    <p className="font-montserrat text-xs text-[#787570] mt-1 uppercase tracking-wide">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual Representation of Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            viewport={{ once: true }}
            className="relative"
            onClick={handleDashboardClick}
          >
            {/* Abstract Dashboard UI Card */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-[#DDBEA9]/50 bg-[#F2F0E9] aspect-[4/3] cursor-pointer hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow">
              {/* Header */}
              <div className="h-10 bg-[#E6E4DC] border-b border-[#DDBEA9]/30 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#B07D62]/50"></div>
                <div className="w-3 h-3 rounded-full bg-[#6B705C]/50"></div>
                <div className="flex-1 text-center">
                  <div className="mx-auto w-32 h-2 rounded-full bg-[#DDBEA9]/40"></div>
                </div>
              </div>
              {/* Body */}
              <div className="p-6 grid grid-cols-3 gap-4">
                 {/* Sidebar Mock */}
                 <div className="col-span-1 space-y-3">
                    <div className="h-8 w-full bg-[#E6E4DC] rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-[#E6E4DC] rounded"></div>
                    <div className="h-4 w-3/4 bg-[#E6E4DC] rounded"></div>
                    <div className="h-4 w-1/2 bg-[#E6E4DC] rounded"></div>
                 </div>
                 {/* Main Content Mock */}
                 <div className="col-span-2 space-y-4">
                    <div className="h-24 w-full bg-white border border-[#DDBEA9]/30 rounded p-4 flex flex-col justify-between">
                       <div className="flex justify-between">
                          <div className="w-8 h-8 bg-[#6B705C]/20 rounded-full flex items-center justify-center">
                            <Activity size={14} className="text-[#6B705C]" />
                          </div>
                          <div className="w-16 h-4 bg-[#E6E4DC] rounded"></div>
                       </div>
                       <div className="w-full h-2 bg-[#E6E4DC] rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-[#6B705C]"></div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="h-20 bg-white border border-[#DDBEA9]/30 rounded"></div>
                       <div className="h-20 bg-white border border-[#DDBEA9]/30 rounded"></div>
                    </div>
                 </div>
              </div>
              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="bg-[#2E2C29] text-[#F2F0E9] px-6 py-2 rounded-full font-poppins text-sm">
                  View Live Dashboard
                </span>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-[#DDBEA9] rounded-full blur-[80px] opacity-50"></div>
            <div className="absolute -z-10 -top-10 -left-10 w-40 h-40 bg-[#6B705C] rounded-full blur-[80px] opacity-30"></div>
          </motion.div>
        </div>
      </section>

      {/* --- Journey Stages --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl text-[#2E2C29]">The Journey</h2>
          <p className="font-cursive text-xl text-[#B07D62] mt-2">Tracked every step of the way</p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DDBEA9] to-transparent -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {STAGES.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div 
                  className="bg-[#F2F0E9] border border-[#E6E4DC] p-8 rounded-2xl relative hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F2F0E9] p-2">
                     <div 
                       className="w-12 h-12 rounded-full flex items-center justify-center border border-[#DDBEA9]"
                       style={{ backgroundColor: THEME.colors.surface }}
                     >
                       <stage.icon strokeWidth={1} className="w-6 h-6 text-[#2E2C29]" />
                     </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <h3 className="font-poppins font-bold text-xl mb-2">{stage.title}</h3>
                    <p className="font-source-serif text-[#787570] mb-4">{stage.desc}</p>
                    <div className="inline-block px-3 py-1 bg-[#E6E4DC] rounded text-[10px] font-montserrat text-[#6B705C]">
                      TX: {stage.hash}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Audit / Trust Section --- */}
      <section className="py-20 bg-[#2E2C29] text-[#F2F0E9]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-[#6B705C]" strokeWidth={1} />
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Tamper-Proof Audit Trails
          </h2>
          <p className="font-source-serif text-lg text-[#E6E4DC]/70 mb-10 leading-relaxed">
            Unlike traditional databases, our Ethereum-backed ledger means once a record is written, 
            it cannot be altered or deleted. Provide your customers with absolute proof of origin.
          </p>
          
          <button 
             onClick={handleDashboardClick}
             className="px-8 py-3 border border-[#6B705C] text-[#6B705C] hover:bg-[#6B705C] hover:text-white transition-colors rounded-lg font-montserrat tracking-wide uppercase text-sm"
          >
            Verify a Product
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 border-t border-[#DDBEA9]/30 text-center">
         <div className="mb-6 flex justify-center items-center gap-2 opacity-60">
            <Box className="w-5 h-5" />
            <span className="font-source-serif font-semibold">SupplyOnChain</span>
         </div>
         <p className="font-source-serif text-sm text-[#787570]">
           Built for the Modern Web. <br/>
           <span className="font-montserrat text-xs mt-2 block opacity-50">© 2025 Blockchain Supply Chain. Open Source.</span>
         </p>
      </footer>
    </div>
  );
}

export default LandingPage;