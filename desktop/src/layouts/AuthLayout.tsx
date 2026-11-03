import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col justify-center items-center p-4 w-full relative overflow-hidden font-sans selection:bg-[#FF2D95] selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#007AB7]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#FF2D95]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Return to public site link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center relative z-10">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to SmartQueue Home</span>
        </button>
        <span className="text-[10px] font-mono text-[#007AB7] px-2 py-0.5 rounded bg-[#007AB7]/10 border border-[#007AB7]/30">
          STAFF GATEWAY
        </span>
      </div>

      <div className="w-full max-w-md glass-panel rounded-3xl shadow-2xl overflow-hidden p-8 border border-white/10 relative z-10 backdrop-blur-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 mx-auto mb-4 shadow-glow-dual">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center">
              <span className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95] text-2xl tracking-wider">
                SQ
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-heading font-black text-white tracking-tight uppercase">
            Smart<span className="text-[#FF2D95]">Queue</span> Portal
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Supermarket Operations & Cashier Desk</p>
        </div>

        <Outlet />
      </div>

      <div className="mt-6 text-center text-xs font-mono text-slate-500 relative z-10">
        &copy; 2026 SmartQueue Enterprise Retail Platform. All rights reserved.
      </div>
    </div>
  );
};