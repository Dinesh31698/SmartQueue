import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Store,
  Layers,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const cashierLinks = [
    { to: '/cashier', label: 'Cashier Station', icon: Store },
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
    { to: '/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-lg">
          SQ
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base tracking-tight">SmartQueue</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">ENTERPRISE DESK</span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {(role === 'CASHIER' || role === 'MANAGER' || role === 'ADMIN') && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Cashier Lane
            </div>
            <div className="space-y-1">
              {cashierLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {(role === 'MANAGER' || role === 'ADMIN') && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Store Management
            </div>
            <div className="space-y-1">
              {managerLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {role === 'ADMIN' && (
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Administration
            </div>
            <div className="space-y-1">
              {adminLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div>SmartQueue Desk v1.0</div>
        <div className="text-[10px] text-slate-500">Connected to Central Server</div>
      </div>
    </aside>
  );
};
