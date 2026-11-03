import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ScanLine,
  Layers,
  ShoppingBag,
  TrendingUp,
  Cpu,
  Bot,
  Clock,
  CheckCircle2,
  Users,
  Store,
  QrCode,
  Radio,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SimulatedPrompt {
  query: string;
  response: string;
  category: string;
  products: { name: string; aisle: string; price: string }[];
}

const AI_DEMO_PROMPTS: SimulatedPrompt[] = [
  {
    query: "Find organic dairy products and gluten-free oats",
    category: "Dietary & Wellness",
    response: "Located 2 matching organic items with high freshness ratings. Added aisle directions to your live map.",
    products: [
      { name: "Organic Farm Whole Milk (1L)", aisle: "Aisle 3 - Dairy Cold Rack", price: "$3.49" },
      { name: "Certified Gluten-Free Rolled Oats (500g)", aisle: "Aisle 5 - Breakfast Cereal", price: "$4.99" }
    ]
  },
  {
    query: "Where is extra virgin olive oil located?",
    category: "In-Store Navigation",
    response: "Extra Virgin Olive Oil is located in Aisle 2, Section B (Oils & Vinegars). Premium Italian harvest in stock.",
    products: [
      { name: "Cold-Pressed Extra Virgin Olive Oil (750ml)", aisle: "Aisle 2 - Shelf B2", price: "$12.99" },
      { name: "Organic Mediterranean Olive Oil (500ml)", aisle: "Aisle 2 - Shelf B4", price: "$8.50" }
    ]
  },
  {
    query: "Suggest high-protein snacks under $5",
    category: "Smart Budget Assistant",
    response: "Found 3 nutritionist-recommended high-protein snacks currently on aisle promotion under $5.",
    products: [
      { name: "Greek Yogurt Plain High-Protein (200g)", aisle: "Aisle 3 - Cold Dairy", price: "$2.20" },
      { name: "Roasted Almonds & Sea Salt (100g)", aisle: "Aisle 7 - Healthy Snacks", price: "$3.99" }
    ]
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 font-sans selection:bg-[#FF2D95] selection:text-white relative overflow-x-hidden">
      {/* Ambient Cybernetic Lighting Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] bg-[#007AB7]/15 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[650px] h-[650px] bg-[#FF2D95]/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[600px] bg-[#007AB7]/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-30 bg-repeat" />
      </div>

      {/* Floating Glassmorphic Navbar */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual">
              <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center">
                <span className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95] text-lg tracking-wider">
                  SQ
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-white tracking-tight leading-tight flex items-center gap-1.5">
                SMART<span className="text-[#FF2D95]">QUEUE</span>
              </span>
              <span className="text-[10px] text-[#007AB7] font-mono tracking-widest font-semibold uppercase">
                AI Retail Ecosystem
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#ai-shopping" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>AI Assistant</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FF2D95]/20 text-[#FF2D95] rounded-full border border-[#FF2D95]/30">LIVE</span>
            </a>
            <a href="#impact" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:text-white rounded-xl border border-white/10 hover:border-[#007AB7]/50 hover:bg-[#007AB7]/10 transition duration-200"
            >
              Staff Portal
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#007AB7] to-[#FF2D95] rounded-xl hover:opacity-95 shadow-glow-dual transition duration-200 flex items-center gap-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 glass-panel rounded-2xl border border-white/10 shadow-2xl space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              How It Works
            </a>
            <a
              href="#ai-shopping"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              AI Assistant
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
            >
              Enterprise Impact
            </a>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-center text-white bg-[#007AB7] rounded-xl shadow-glow-blue"
              >
                Staff Portal Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-28 sm:pt-36">
        {/* =========================================================================
            SECTION 1: HERO (Cinematic Cybernetic Visual)
           ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Bold Typography & Dual Glow CTAs */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111318] border border-white/10 text-xs font-mono shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#FF2D95] animate-ping" />
                <span className="text-slate-300 font-medium">SMART SUPERMARKET PLATFORM</span>
                <span className="text-[#007AB7] font-bold">v2.4 ACTIVE</span>
              </div>

              {/* Massive Cinematic Headings matching HUMAN NEXT reference aesthetic */}
              <div className="space-y-2">
                <h2 className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-slate-400 font-semibold">
                  A CALMER TOMORROW IN RETAIL
                </h2>
                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-heading font-black tracking-tight leading-[0.95] uppercase">
                  <span className="block text-white drop-shadow-[0_0_35px_rgba(0,122,183,0.35)]">
                    SHOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#38BDF8]">SMARTER</span>.
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D95] to-[#EC4899] drop-shadow-[0_0_35px_rgba(255,45,149,0.35)] mt-1">
                    QUEUE <span className="text-white">LESS</span>.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl pt-4 leading-relaxed">
                  SmartQueue merges computer vision barcode scanning, natural-language AI shopping guidance,
                  and real-time queue orchestration into a unified smart supermarket ecosystem for Android and Desktop.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white font-semibold text-sm tracking-wide shadow-glow-blue hover:brightness-110 transition duration-200 flex items-center gap-2 group"
                >
                  <span>Launch Staff Operations</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-7 py-3.5 rounded-xl bg-[#111318] text-slate-200 hover:text-white font-semibold text-sm tracking-wide border border-[#FF2D95]/40 hover:border-[#FF2D95] hover:bg-[#FF2D95]/10 shadow-glow-rose transition duration-200 flex items-center gap-2"
                >
                  <span>See How It Works</span>
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              {/* Live Highlights Bullet Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-baseline">
                    <span>94</span><span className="text-[#007AB7] text-lg">%</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">Wait Reduction</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-baseline">
                    <span>&lt;1</span><span className="text-[#FF2D95] text-lg">s</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">Vision Scan Latency</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-white flex items-baseline">
                    <span>100</span><span className="text-[#007AB7] text-lg">%</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">Live WebSocket Sync</div>
                </div>
              </div>
            </div>

            {/* Right Column: Holographic 3D Interactive Cyber-Supermarket Stage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl p-1 bg-gradient-to-tr from-[#007AB7] via-transparent to-[#FF2D95] shadow-glow-dual">
                <div className="w-full h-full rounded-[22px] bg-[#0A0A0A]/95 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-2xl">
                  {/* Subtle Grid Matrix in background */}
                  <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-[#007AB7] animate-ping" />
                      <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
                        SUPERMARKET FLAGSHIP #104
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 font-semibold">
                      LANE ACTIVE
                    </span>
                  </div>

                  {/* Holographic Interactive Artifact: Virtual Ticket Display */}
                  <div className="my-auto py-4 relative z-10 space-y-4">
                    <div className="glass-card rounded-2xl p-5 border border-[#007AB7]/30 bg-[#111318]/90 shadow-glow-blue relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Live Queue Ticket</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          NOW SERVING
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-4xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#007AB7] tracking-wider">
                          Q-104
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-slate-300 font-mono">Counter 02</div>
                          <div className="text-[11px] text-[#007AB7] font-semibold">Ready for Billing</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 text-xs font-mono text-slate-300">
                        <div>Position: <span className="text-white font-bold">1st in Line</span></div>
                        <div className="text-right">Est. Wait: <span className="text-[#FF2D95] font-bold">&lt; 1 min</span></div>
                      </div>
                    </div>

                    {/* Floating Secondary Mini Hologram: Live Cart Summary */}
                    <div className="glass-card rounded-xl p-3.5 border border-[#FF2D95]/30 bg-[#171A21]/90 shadow-glow-rose flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF2D95]/20 flex items-center justify-center text-[#FF2D95]">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">Organic Cart Items</div>
                          <div className="text-[11px] text-slate-400 font-mono">4 items scanned</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-white">$42.80</div>
                        <div className="text-[10px] text-emerald-400 font-mono">Verified</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: System Live Indicator */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#007AB7]" />
                      <span>AI Recommender Ready</span>
                    </span>
                    <span className="text-slate-500">Android + POS Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: METRICS & SYSTEM PERFORMANCE STRIP
           ========================================================================= */}
        <section className="border-y border-white/10 bg-[#050505]/80 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  4.8<span className="text-[#007AB7]">x</span>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 font-semibold">
                  Cashier Throughput
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Pre-scanned verified carts</p>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  0<span className="text-[#FF2D95]">min</span>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 font-semibold">
                  Physical Queue Standing
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Virtual queue notifications</p>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  99.8<span className="text-[#007AB7]">%</span>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 font-semibold">
                  CameraX Vision Precision
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Instant barcode detection</p>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  100<span className="text-[#FF2D95]">%</span>
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 font-semibold">
                  Real-Time Bi-Directional
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Socket.IO real-time backbone</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: BENTO GRID FEATURES SHOWCASE
           ========================================================================= */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-white/10 text-xs font-mono text-[#007AB7]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2D95]" />
              <span>CORE CAPABILITIES MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight">
              ENGINEERED FOR THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">FUTURE OF RETAIL</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every component works synchronously. From customer smartphones to cashier POS terminals
              and executive monitoring consoles.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Feature 1: Large Bento (2 cols) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#007AB7]/50 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-[#007AB7]/10 group-hover:text-[#007AB7]/20 transition-colors">
                <Bot className="w-36 h-36" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#007AB7]/20 border border-[#007AB7]/40 flex items-center justify-center text-[#007AB7] shadow-glow-blue">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Natural-Language AI Shopping Assistant
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  Trained on supermarket inventory, aisle locations, and dietary parameters.
                  Shoppers ask questions in natural language and receive instant aisle directions,
                  healthy substitutes, and price comparisons directly inside the native Android app.
                </p>
                <div className="pt-4 flex flex-wrap gap-2 font-mono text-xs">
                  <span className="px-3 py-1 rounded-lg bg-[#111318] border border-white/10 text-slate-300">
                    Aisle Mapping
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#111318] border border-white/10 text-slate-300">
                    Dietary Filters
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#111318] border border-white/10 text-slate-300">
                    Budget Optimization
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 2: Barcode Vision Scanning */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#FF2D95]/50 transition duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF2D95]/20 border border-[#FF2D95]/40 flex items-center justify-center text-[#FF2D95] shadow-glow-rose">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">
                  Native CameraX Vision Scanner
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Sub-second barcode scanning using Android CameraX and Google ML Kit with haptic feedback
                  and instant catalog match.
                </p>
                <div className="pt-2 text-xs font-mono text-[#FF2D95]">
                  EAN-13 • UPC-A • QR
                </div>
              </div>
            </div>

            {/* Feature 3: Smart Queue Algorithm */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#007AB7]/50 transition duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#007AB7]/20 border border-[#007AB7]/40 flex items-center justify-center text-[#007AB7] shadow-glow-blue">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">
                  Intelligent Lane Balancing
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Dynamic wait prediction balances waiting shoppers across operational counters to avoid cashier choke points.
                </p>
                <div className="pt-2 text-xs font-mono text-[#007AB7]">
                  Predictive Wait Estimation
                </div>
              </div>
            </div>

            {/* Feature 4: Cashier POS Operations */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#FF2D95]/50 transition duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF2D95]/20 border border-[#FF2D95]/40 flex items-center justify-center text-[#FF2D95] shadow-glow-rose">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">
                  Cashier POS Command Station
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  High-efficiency cashier interface with call next, skip, manual barcode scanner, and printable tax invoice generation.
                </p>
                <div className="pt-2 text-xs font-mono text-emerald-400">
                  Instant POS Invoicing
                </div>
              </div>
            </div>

            {/* Feature 5: Large Bento (2 cols) - Real-Time Dashboard & Analytics */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#007AB7]/50 transition duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual">
                  <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Executive Store Analytics & Live Fleet Control
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  Managers track revenue trajectories, peak hour bottlenecks, cashier velocity,
                  and low-stock alerts with real-time Recharts visualizations and one-click audit reports.
                </p>
                <div className="pt-4 grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#111318] border border-white/10">
                    <div className="text-slate-400">Hourly Throughput</div>
                    <div className="text-white font-bold mt-1">Live Tracked</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111318] border border-white/10">
                    <div className="text-slate-400">Low Stock Trigger</div>
                    <div className="text-[#FF2D95] font-bold mt-1">Automated</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111318] border border-white/10">
                    <div className="text-slate-400">Audit Reports</div>
                    <div className="text-[#007AB7] font-bold mt-1">CSV Export</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6: NFC & QR Store Pairing */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#007AB7]/50 transition duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#007AB7]/20 border border-[#007AB7]/40 flex items-center justify-center text-[#007AB7] shadow-glow-blue">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">
                  NFC & QR Store Pairing
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Shoppers enter a supermarket and tap an NFC shelf tag or scan an entrance QR code to load the store catalog immediately.
                </p>
                <div className="pt-2 text-xs font-mono text-[#007AB7]">
                  Instant Store Pairing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: INTERACTIVE 6-STEP "HOW IT WORKS" TIMELINE
           ========================================================================= */}
        <section id="how-it-works" className="py-24 bg-[#050505] border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-white/10 text-xs font-mono text-[#FF2D95]">
                <Clock className="w-3.5 h-3.5" />
                <span>SEAMLESS SHOPPER LIFECYCLE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight">
                HOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">SMARTQUEUE WORKS</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                From store entry to final cashier confirmation in 6 intuitive, frictionless steps.
              </p>
            </div>

            {/* Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#007AB7]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#007AB7] px-2.5 py-1 rounded-lg bg-[#007AB7]/10 border border-[#007AB7]/30">
                    STEP 01
                  </span>
                  <QrCode className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Tap NFC or Scan Store QR</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Upon stepping into the supermarket, open the SmartQueue Android app. Tap the entrance NFC tag or scan the store QR code to sync catalog and pricing.
                </p>
              </div>

              {/* Step 2 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#FF2D95]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#FF2D95] px-2.5 py-1 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30">
                    STEP 02
                  </span>
                  <Bot className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Ask the AI Assistant</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Need gluten-free items, aisle directions, or recipes on a budget? The built-in AI assistant answers immediately with aisle coordinates and live shelf stock.
                </p>
              </div>

              {/* Step 3 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#007AB7]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#007AB7] px-2.5 py-1 rounded-lg bg-[#007AB7]/10 border border-[#007AB7]/30">
                    STEP 03
                  </span>
                  <ScanLine className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Scan Items as You Shop</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Point the camera at product barcodes. Items are instantly added to your live in-app cart with real-time tax calculation and discount tracking.
                </p>
              </div>

              {/* Step 4 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#FF2D95]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#FF2D95] px-2.5 py-1 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30">
                    STEP 04
                  </span>
                  <ShoppingBag className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Digital Checkout & Payment</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Review your itemized cart. Select your preferred payment method: UPI, Credit Card, Digital Wallet, or Cash at counter with 1 tap.
                </p>
              </div>

              {/* Step 5 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#007AB7]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#007AB7] px-2.5 py-1 rounded-lg bg-[#007AB7]/10 border border-[#007AB7]/30">
                    STEP 05
                  </span>
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Receive Live Queue Ticket</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Instantly obtain a virtual queue token (e.g. Q-104). Stroll freely around the store while tracking shoppers ahead and estimated wait times in real time.
                </p>
              </div>

              {/* Step 6 */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-[#FF2D95]/60 transition duration-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#FF2D95] px-2.5 py-1 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30">
                    STEP 06
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2">Called to Counter & Bagged</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  When your number is called, head straight to the assigned counter. The cashier instantly reviews your verified cart and hands you your receipt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: INTERACTIVE AI ASSISTANT SHOWCASE
           ========================================================================= */}
        <section id="ai-shopping" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Description & Interactive Prompt Selectors */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-white/10 text-xs font-mono text-[#007AB7]">
                <Bot className="w-3.5 h-3.5 text-[#FF2D95]" />
                <span>INTELLIGENT SHOPPING COPILOT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight">
                EXPERIENCE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">AI ASSISTANT</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                SmartQueue doesn't just manage lines — it guides the shopper through the store.
                Click on the sample prompts below to test our real-time recommendation engine.
              </p>

              {/* Sample Prompts Buttons */}
              <div className="space-y-3 pt-2">
                {AI_DEMO_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePromptIdx(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex items-center justify-between ${
                      activePromptIdx === idx
                        ? 'bg-[#111318] border-[#007AB7] shadow-glow-blue'
                        : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF2D95] font-semibold">
                        {prompt.category}
                      </span>
                      <div className="text-xs sm:text-sm font-medium text-white">
                        "{prompt.query}"
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 ${activePromptIdx === idx ? 'text-[#007AB7] translate-x-1' : ''} transition-transform`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Simulated AI Terminal */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#007AB7]/40 shadow-glow-blue relative">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-400">SmartQueue AI Copilot • v2.4</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-6">
                  {/* User Question */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="p-4 rounded-2xl bg-[#007AB7]/20 border border-[#007AB7]/40 text-xs sm:text-sm text-white max-w-lg">
                      <div className="text-[10px] font-mono text-[#007AB7] mb-1 font-semibold">YOU (SHOPPER)</div>
                      "{AI_DEMO_PROMPTS[activePromptIdx].query}"
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 shrink-0 shadow-glow-dual">
                      <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center text-white">
                        <Bot className="w-4 h-4 text-[#FF2D95]" />
                      </div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="p-4 rounded-2xl bg-[#111318] border border-white/10 text-xs sm:text-sm text-slate-200">
                        <div className="text-[10px] font-mono text-[#FF2D95] mb-1 font-semibold">SMARTQUEUE AI</div>
                        {AI_DEMO_PROMPTS[activePromptIdx].response}
                      </div>

                      {/* Product Recommendations Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AI_DEMO_PROMPTS[activePromptIdx].products.map((prod, pIdx) => (
                          <div key={pIdx} className="p-3.5 rounded-xl bg-[#171A21] border border-white/10 hover:border-[#007AB7]/40 transition space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-white leading-tight">{prod.name}</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{prod.price}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Store className="w-3 h-3 text-[#007AB7]" />
                              <span>{prod.aisle}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: STAKEHOLDER VALUE MATRIX
           ========================================================================= */}
        <section id="impact" className="py-24 bg-[#050505] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-white/10 text-xs font-mono text-[#007AB7]">
                <Users className="w-3.5 h-3.5" />
                <span>MULTI-STAKEHOLDER BENEFITS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight">
                DESIGNED FOR EVERYONE ON <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">THE RETAIL FLOOR</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* For Shoppers */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#007AB7]/40 transition space-y-4">
                <div className="text-xs font-mono text-[#007AB7] font-semibold tracking-wider uppercase">For Shoppers</div>
                <h3 className="text-lg font-heading font-bold text-white">Zero Standing in Line</h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Real-time virtual queue token with turn alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Live shopping cart subtotal and tax calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Instant aisle directions via AI shopping copilot</span>
                  </li>
                </ul>
              </div>

              {/* For Cashiers */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#FF2D95]/40 transition space-y-4">
                <div className="text-xs font-mono text-[#FF2D95] font-semibold tracking-wider uppercase">For Cashiers</div>
                <h3 className="text-lg font-heading font-bold text-white">4x Faster Checkout</h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>Pre-scanned verified carts ready on counter screen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>1-click ticket calling, customer skip, and completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>Automated printable thermal invoice generator</span>
                  </li>
                </ul>
              </div>

              {/* For Store Managers */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#007AB7]/40 transition space-y-4">
                <div className="text-xs font-mono text-[#007AB7] font-semibold tracking-wider uppercase">For Store Managers</div>
                <h3 className="text-lg font-heading font-bold text-white">Operational Clarity</h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Live queue monitor across all active counters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Dynamic lane opens/closures based on customer density</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#007AB7] shrink-0 mt-0.5" />
                    <span>Automated low-stock notifications and restock alerts</span>
                  </li>
                </ul>
              </div>

              {/* For Enterprise Chains */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#FF2D95]/40 transition space-y-4">
                <div className="text-xs font-mono text-[#FF2D95] font-semibold tracking-wider uppercase">For Enterprises</div>
                <h3 className="text-lg font-heading font-bold text-white">High Revenue Velocity</h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>Increased floor turnover during peak rush hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>CSV business intelligence and cashier performance audit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                    <span>Zero hardware lock-in: works on standard Android + Web</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: CINEMATIC FINAL CALL TO ACTION
           ========================================================================= */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 mx-auto shadow-glow-dual">
              <div className="w-full h-full bg-[#0A0A0A] rounded-[22px] flex items-center justify-center text-white">
                <Sparkles className="w-8 h-8 text-[#FF2D95]" />
              </div>
            </div>

            <h2 className="text-4xl sm:text-6xl font-heading font-black uppercase text-white tracking-tight">
              ELEVATE YOUR SUPERMARKET WITH <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] via-slate-100 to-[#FF2D95]">
                INTELLIGENT QUEUEING
              </span>
            </h2>

            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Experience the complete real-time SmartQueue system today. Test cashier checkout terminals,
              run manager operations, or pair with our native Android customer app.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#007AB7] to-[#FF2D95] text-white font-bold text-sm tracking-wide shadow-glow-dual hover:opacity-90 transition duration-200 flex items-center gap-2 group"
              >
                <span>Launch Staff Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer className="border-t border-white/10 bg-[#050505] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#007AB7] to-[#FF2D95] flex items-center justify-center text-white font-bold text-xs">
              SQ
            </div>
            <span className="text-sm font-semibold text-slate-300 font-heading">SmartQueue Retail System</span>
            <span className="text-xs text-slate-600 font-mono">|</span>
            <span className="text-xs text-slate-500 font-mono">Commercial Release 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Backend API: Online</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#007AB7]" />
              <span>WebSocket Sync: Active</span>
            </span>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors underline">
              Staff Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};