import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';
import {
  LayoutDashboard,
  Store,
  Layers,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  Users,
  Cpu,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const role = user?.role;

  const cashierLinks = [
    { to: '/cashier', label: 'Cashier POS Lane', icon: Store },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Operations Dashboard', icon: LayoutDashboard },
    { to: '/queue', label: 'Live Queue Lanes', icon: Layers },
    { to: '/orders', label: 'Customer Orders', icon: ShoppingBag },
    { to: '/inventory', label: 'Stock & Inventory', icon: Package },
    { to: '/analytics', label: 'Business Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'System Overview', icon: LayoutDashboard },
    { to: '/users', label: 'Staff Management', icon: Users },
    { to: '/settings', label: 'Store Parameters', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0D11] border-r border-white/10 text-slate-300 flex flex-col shrink-0 min-h-screen relative z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-[#07080B]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-[#0A0A0A] rounded-[9px] flex items-center justify-center">
            <span className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95] text-sm tracking-wider">
              SQ
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-white text-sm tracking-tight flex items-center gap-1">
            SMART<span className="text-[#FF2D95]">QUEUE</span>
          </span>
          <span className="text-[9px] text-[#007AB7] font-mono tracking-widest font-semibold uppercase">
            ENTERPRISE DESK
          </span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {(role === 'CASHIER' || role === 'MANAGER' || role === 'ADMIN') && (
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
              <span>Checkout Counter</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AB7]" />
            </div>
            <div className="space-y-1">
              {cashierLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-[#007AB7]/20 border border-[#007AB7]/50 text-white shadow-glow-blue'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-[#007AB7]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {(role === 'MANAGER' || role === 'ADMIN') && (
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
              <span>Store Operations</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D95]" />
            </div>
            <div className="space-y-1">
              {managerLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-[#007AB7]/20 border border-[#007AB7]/50 text-white shadow-glow-blue'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-[#007AB7]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {role === 'ADMIN' && (
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
              <span>Administration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AB7]" />
            </div>
            <div className="space-y-1">
              {adminLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                      isActive
                        ? 'bg-[#FF2D95]/20 border border-[#FF2D95]/50 text-white shadow-glow-rose'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-[#FF2D95]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/10 bg-[#07080B] text-xs font-mono text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-semibold">SmartQueue Core</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            v2.4
          </span>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
          <Cpu className={`w-3 h-3 ${isConnected ? 'text-[#007AB7]' : 'text-rose-400'}`} />
          <span className={isConnected ? 'text-slate-400' : 'text-rose-400'}>
            {isConnected ? 'Central Server Synced' : 'Reconnecting...'}
          </span>
        </div>
      </div>
    </aside>
  );
};