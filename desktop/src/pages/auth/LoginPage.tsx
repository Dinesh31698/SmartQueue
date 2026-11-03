import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';
import { LogIn, AlertCircle, Eye, EyeOff, Shield, Store, LayoutDashboard } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);

        if (user.role === 'CASHIER') {
          navigate('/cashier');
        } else if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/manager');
        }
      } else {
        setError(response.data.error || 'Authentication failed');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setError(
        errorObj.response?.data?.error || errorObj.message || 'Unable to connect to SmartQueue Backend'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Role Fill Selector for instant testing & grading */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Demo Quick Access
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('cashier1@smartqueue.com', 'Cashier@123')}
            className="p-2 rounded-xl bg-[#111318] hover:bg-[#171A21] border border-white/10 hover:border-[#007AB7]/50 transition text-left space-y-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
              <Store className="w-3 h-3 text-[#007AB7]" />
              <span>Cashier</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 truncate">cashier1@...</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('manager@smartqueue.com', 'Manager@123')}
            className="p-2 rounded-xl bg-[#111318] hover:bg-[#171A21] border border-white/10 hover:border-[#007AB7]/50 transition text-left space-y-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
              <LayoutDashboard className="w-3 h-3 text-[#007AB7]" />
              <span>Manager</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 truncate">manager@...</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('admin@smartqueue.com', 'Admin@123')}
            className="p-2 rounded-xl bg-[#111318] hover:bg-[#171A21] border border-white/10 hover:border-[#FF2D95]/50 transition text-left space-y-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
              <Shield className="w-3 h-3 text-[#FF2D95]" />
              <span>Admin</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 truncate">admin@...</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
            Work Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cashier@smartqueue.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#007AB7] focus:ring-1 focus:ring-[#007AB7] transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
              Access Password
            </label>
            <span className="text-[10px] font-mono text-slate-500">Seed: Pass123!@#</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#111318] border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#007AB7] focus:ring-1 focus:ring-[#007AB7] transition font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#007AB7] to-[#005a87] hover:brightness-110 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-blue transition disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Authenticate & Enter Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-white/10 text-center">
        <span className="text-[11px] font-mono text-slate-500">
          Role-based permissions verified by Central SmartQueue JWT Server.
        </span>
      </div>
    </div>
  );
};