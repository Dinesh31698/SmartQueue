import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-slate-100 font-sans selection:bg-[#FF2D95] selection:text-white w-full relative">
      {/* Background cybernetic grid */}
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none z-0" />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};