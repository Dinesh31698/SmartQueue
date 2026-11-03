import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface HourlyTraffic {
  hour: string;
  tickets: number;
}

interface TopProduct {
  id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface CashierStat {
  id: string;
  name: string;
  email: string;
  ordersProcessed: number;
  revenueGenerated: number;
}

export const AnalyticsPage: React.FC = () => {
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([
    { date: '2026-10-28', revenue: 24500, orders: 38 },
    { date: '2026-10-29', revenue: 31200, orders: 49 },
    { date: '2026-10-30', revenue: 28900, orders: 44 },
    { date: '2026-10-31', revenue: 45000, orders: 67 },
    { date: '2026-11-01', revenue: 58400, orders: 89 },
    { date: '2026-11-02', revenue: 52100, orders: 81 },
    { date: '2026-11-03', revenue: 44900, orders: 68 },
  ]);

  const [queueTraffic, setQueueTraffic] = useState<HourlyTraffic[]>([
    { hour: '08:00 AM', tickets: 12 },
    { hour: '10:00 AM', tickets: 28 },
    { hour: '12:00 PM', tickets: 45 },
    { hour: '02:00 PM', tickets: 33 },
    { hour: '04:00 PM', tickets: 48 },
    { hour: '06:00 PM', tickets: 62 },
    { hour: '08:00 PM', tickets: 39 },
  ]);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([
    { id: '1', name: 'Amul Taaza Homogenised Toned Milk 1L', totalQuantity: 145, totalRevenue: 10730 },
    { id: '2', name: 'Aashirvaad Shudh Chakki Atta 5kg', totalQuantity: 88, totalRevenue: 25080 },
    { id: '3', name: 'Tata Salt Vacuum Evaporated 1kg', totalQuantity: 112, totalRevenue: 3136 },
    { id: '4', name: 'Maggi 2-Minute Instant Noodles 280g', totalQuantity: 95, totalRevenue: 5510 },
    { id: '5', name: 'Britannia 100% Whole Wheat Bread 400g', totalQuantity: 74, totalRevenue: 3700 },
  ]);

  const [cashierStats, setCashierStats] = useState<CashierStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesRes, trafficRes, topProdRes, cashiersRes] = await Promise.all([
        apiClient.get('/analytics/sales').catch(() => null),
        apiClient.get('/analytics/queue-traffic').catch(() => null),
        apiClient.get('/analytics/top-products').catch(() => null),
        apiClient.get('/analytics/cashier-stats').catch(() => null),
      ]);

      if (salesRes?.data?.success && salesRes.data.data.length > 0) {
        setSalesTrends(salesRes.data.data);
      }
      if (trafficRes?.data?.success && trafficRes.data.data.length > 0) {
        setQueueTraffic(trafficRes.data.data);
      }
      if (topProdRes?.data?.success && topProdRes.data.data.length > 0) {
        setTopProducts(topProdRes.data.data);
      }
      if (cashiersRes?.data?.success) {
        setCashierStats(cashiersRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Export CSV Functionality
  const exportCSV = () => {
    const headers = ['Date', 'Revenue (INR)', 'Orders Count'];
    const rows = salesTrends.map((s) => [s.date, s.revenue, s.orders]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartqueue_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#007AB7]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#007AB7] font-semibold">
              EXECUTIVE INTELLIGENCE FEED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            Business Reports & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Revenue trajectory, hourly queue demand, and cashier velocity telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#007AB7] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl text-xs font-mono font-semibold shadow-glow-blue hover:brightness-110 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trajectory AreaChart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                7-Day Sales Trajectory
              </h2>
              <p className="text-xs font-mono text-slate-500">Gross checkout revenue volume</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#007AB7]/20 border border-[#007AB7]/40 flex items-center justify-center text-[#007AB7] shadow-glow-blue">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="analyticsSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AB7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#007AB7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
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
                  fill="url(#analyticsSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Queue Demand BarChart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Hourly Queue Traffic Demand
              </h2>
              <p className="text-xs font-mono text-slate-500">Shopper queue tokens issued per operating hour</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FF2D95]/20 border border-[#FF2D95]/40 flex items-center justify-center text-[#FF2D95] shadow-glow-rose">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueTraffic}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${value} tickets`, 'Queue Volume']}
                  contentStyle={{
                    backgroundColor: '#0B0D11',
                    border: '1px solid rgba(255,45,149,0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(255,45,149,0.3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="tickets" fill="#FF2D95" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Staff Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#007AB7]" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Top Selling SKUs</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">By volume</span>
          </div>

          <table className="w-full text-left text-xs font-mono mt-3">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                <th className="pb-2.5">Product SKU</th>
                <th className="pb-2.5 text-center">Units Sold</th>
                <th className="pb-2.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-white/5 transition">
                  <td className="py-2.5 text-white">{p.name}</td>
                  <td className="py-2.5 text-center font-bold text-[#007AB7]">{p.totalQuantity}</td>
                  <td className="py-2.5 text-right font-bold text-white">
                    {formatCurrency(p.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Staff Productivity Table */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF2D95]" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Cashier Velocity</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Real-time throughput</span>
          </div>

          {cashierStats.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No cashier transactions logged yet today.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono mt-3">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2.5">Staff Member</th>
                  <th className="pb-2.5 text-center">Invoices</th>
                  <th className="pb-2.5 text-right">Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cashierStats.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#FF2D95]">{c.ordersProcessed}</td>
                    <td className="py-2.5 text-right font-bold text-white">
                      {formatCurrency(c.revenueGenerated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};