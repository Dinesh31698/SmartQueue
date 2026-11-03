import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
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
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supermarket Operations & Analytics</h1>
          <p className="text-sm text-slate-500">Live overview of store revenue, queue velocity, and checkout lanes.</p>
        </div>

        <button
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{stats.paidOrdersCount} Paid Orders</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Orders Placed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
            {stats.totalOrders} Orders
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Avg basket: {formatCurrency(stats.avgOrderValue)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Queue Waiting</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
            {stats.waitingTickets} Customers
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            Across {stats.activeCounters} active lanes
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Wait Time</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
            ~{stats.avgWaitMinutes} Mins
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {stats.completedTicketsToday} tickets served today
          </div>
        </div>
      </div>

      {/* Main Charts & Live Lanes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Velocity & Trends</h2>
              <p className="text-xs text-slate-500">Real-time revenue accumulation from verified checkout transactions</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Counters Lane Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Live Counter Lanes</h2>
            <p className="text-xs text-slate-500 mb-4">Real-time counter load & cashiers</p>

            <div className="space-y-3">
              {counters.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading checkout lanes...</div>
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
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {lane.name || `Counter ${lane.counterNumber}`}
                        </div>
                        <div className="text-[11px] text-slate-500">{cashierName}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
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
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{lowStockCount} product(s) are approaching low-stock threshold.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
