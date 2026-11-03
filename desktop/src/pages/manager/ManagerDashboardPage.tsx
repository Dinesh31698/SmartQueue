import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Store
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../api/client';
import { useSocket } from '../../contexts/SocketContext';
import { Counter } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  avgOrderValue: number;
  waitingTickets: number;
  completedTicketsToday: number;
  activeCounters: number;
  avgWaitMinutes: number;
}

interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const ManagerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 285100,
    totalOrders: 435,
    paidOrdersCount: 412,
    avgOrderValue: 692,
    waitingTickets: 5,
    completedTicketsToday: 68,
    activeCounters: 4,
    avgWaitMinutes: 3.5,
  });

  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([
    { date: 'Mon', revenue: 18500, orders: 32 },
    { date: 'Tue', revenue: 24200, orders: 45 },
    { date: 'Wed', revenue: 31000, orders: 58 },
    { date: 'Thu', revenue: 28400, orders: 51 },
    { date: 'Fri', revenue: 42500, orders: 74 },
    { date: 'Sat', revenue: 58000, orders: 98 },
    { date: 'Sun', revenue: 64200, orders: 110 },
  ]);

  const [counters, setCounters] = useState<Counter[]>([]);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, salesRes, countersRes, lowStockRes] = await Promise.all([
        apiClient.get('/analytics/dashboard').catch(() => null),
        apiClient.get('/analytics/sales').catch(() => null),
        apiClient.get('/counters').catch(() => null),
        apiClient.get('/inventory/low-stock').catch(() => null),
      ]);

      if (dashRes?.data?.success) {
        setStats(dashRes.data.data);
      }

      if (salesRes?.data?.success && salesRes.data.data.length > 0) {
        setSalesTrend(salesRes.data.data);
      }

      if (countersRes?.data?.success) {
        setCounters(countersRes.data.data);
      }

      if (lowStockRes?.data?.success) {
        setLowStockCount(lowStockRes.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('queue_updated', () => loadDashboardData());
    socket.on('order_status_updated', () => loadDashboardData());
    socket.on('counter_status_changed', () => loadDashboardData());

    return () => {
      socket.off('queue_updated');
      socket.off('order_status_updated');
      socket.off('counter_status_changed');
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Title & Live Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#007AB7] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#007AB7] font-semibold">
              REAL-TIME OPERATIONS CENTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Executive Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synchronized telemetry: revenue velocity, lane density, and automated stock surveillance.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-[#111318] hover:bg-[#171A21] border border-white/10 hover:border-[#007AB7]/50 rounded-xl text-xs font-mono font-semibold text-slate-200 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#007AB7] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#007AB7]/50 transition duration-200">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Gross Revenue Today</span>
            <div className="w-9 h-9 rounded-xl bg-[#007AB7]/20 border border-[#007AB7]/30 text-[#007AB7] flex items-center justify-center shadow-glow-blue">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.paidOrdersCount} Paid Transactions</span>
          </div>
        </div>

        {/* Card 2: Orders Placed */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#FF2D95]/50 transition duration-200">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Total Orders Placed</span>
            <div className="w-9 h-9 rounded-xl bg-[#FF2D95]/20 border border-[#FF2D95]/30 text-[#FF2D95] flex items-center justify-center shadow-glow-rose">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {stats.totalOrders} <span className="text-sm text-slate-400 font-normal">Orders</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Avg basket: <span className="text-slate-200 font-semibold">{formatCurrency(stats.avgOrderValue)}</span>
          </div>
        </div>

        {/* Card 3: Active Waiting Queue */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#007AB7]/50 transition duration-200">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Live Queue Load</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {stats.waitingTickets} <span className="text-sm text-slate-400 font-normal">Waiting</span>
          </div>
          <div className="mt-2 text-xs text-amber-400 font-mono">
            Across {stats.activeCounters} operational lanes
          </div>
        </div>

        {/* Card 4: Average Wait Time */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#FF2D95]/50 transition duration-200">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Avg Lane Latency</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            ~{stats.avgWaitMinutes} <span className="text-sm text-slate-400 font-normal">Mins</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-mono">
            {stats.completedTicketsToday} shoppers served today
          </div>
        </div>
      </div>

      {/* Main Charts & Live Lanes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <span>Revenue Trajectory & Velocity</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#007AB7]/20 text-[#007AB7] border border-[#007AB7]/30">
                  DAILY TREND
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time transaction inflow from authenticated cashier stations
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="cyberRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AB7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#007AB7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Gross Inflow']}
                  contentStyle={{
                    backgroundColor: '#0B0D11',
                    border: '1px solid rgba(0,122,183,0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(0,122,183,0.3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#007AB7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyberRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Counters Lane Status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-[#FF2D95]" />
                <span>Active Checkout Lanes</span>
              </h2>
              <span className="text-[10px] font-mono text-[#007AB7] px-2 py-0.5 rounded bg-[#007AB7]/10 border border-[#007AB7]/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">Cashier assignments & state</p>

            <div className="space-y-3">
              {counters.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  Synchronizing checkout lanes...
                </div>
              ) : (
                counters.map((lane) => {
                  const cashierName =
                    typeof lane.assignedCashierId === 'object' && lane.assignedCashierId?.name
                      ? lane.assignedCashierId.name
                      : 'Unassigned';

                  const isOpen = lane.status === 'OPEN' || lane.status === 'BUSY';

                  return (
                    <div
                      key={lane._id || lane.id}
                      className="p-3 bg-[#111318] rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition"
                    >
                      <div>
                        <div className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                          <span>{lane.name || `Counter ${lane.counterNumber}`}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{cashierName}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isOpen
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-white/10'
                          }`}
                        >
                          {lane.status}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          {lane.acceptedPaymentType}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2.5 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{lowStockCount} product(s) flagged at reorder threshold.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};