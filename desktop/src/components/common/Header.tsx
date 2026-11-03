import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';
import { LogOut, User, Wifi, WifiOff, Store } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 bg-[#0B0D11]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Socket & Store identity */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium border ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Reconnecting...</span>
            </>
          )}
        </div>
        <span className="text-xs text-slate-700">|</span>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Store className="w-3.5 h-3.5 text-[#007AB7]" />
          <span>Supermarket Flagship (STORE-001)</span>
        </div>
      </div>

      {/* Right: User identity & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#111318] border border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[6px] flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">{user?.name || 'Staff User'}</span>
            <span className={`text-[10px] font-mono font-bold tracking-wider ${
              user?.role === 'ADMIN' ? 'text-[#FF2D95]' : 'text-[#007AB7]'
            }`}>
              {user?.role || 'STAFF'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of portal"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/30 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};