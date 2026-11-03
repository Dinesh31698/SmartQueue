import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';
import { LogOut, User, Wifi, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Offline / Connecting</span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-400">|</span>
        <span className="text-xs font-semibold text-gray-500">Supermarket Flagship (STORE-001)</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || 'Staff User'}</span>
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{user?.role || 'STAFF'}</span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
