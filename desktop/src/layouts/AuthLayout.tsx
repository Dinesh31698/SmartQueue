import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 w-full">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-3 shadow-md">
            SQ
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SmartQueue Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Supermarket Operations & Queue Portal</p>
        </div>
        <Outlet />
      </div>
      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; 2026 SmartQueue System. All rights reserved.
      </div>
    </div>
  );
};
