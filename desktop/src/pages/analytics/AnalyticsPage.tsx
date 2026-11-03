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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Business Reports & Supermarket Analytics</h1>
            <p className="text-sm text-slate-500">Revenue trajectory, hourly queue demand, and staff productivity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trajectory AreaChart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">7-Day Sales Trajectory</h2>
              <p className="text-xs text-slate-400">Total verified checkout volume</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Queue Demand BarChart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Hourly Queue Traffic Demand</h2>
              <p className="text-xs text-slate-400">Customer check-in volume throughout operating hours</p>
            </div>
            <Users className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueTraffic}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(value: number) => [`${value} tickets`, 'Customers']}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="tickets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Staff Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Top Selling Products</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">By volume</span>
          </div>

          <table className="w-full text-left text-xs mt-3">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="pb-2">Product Name</th>
                <th className="pb-2 text-center">Units Sold</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 font-medium text-slate-800">{p.name}</td>
                  <td className="py-2.5 text-center font-bold text-slate-700">{p.totalQuantity}</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(p.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Staff Productivity Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Cashier Throughput & Productivity</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Today's metrics</span>
          </div>

          {cashierStats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No staff activity recorded yet today.
            </div>
          ) : (
            <table className="w-full text-left text-xs mt-3">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-2">Staff Member</th>
                  <th className="pb-2 text-center">Bills Processed</th>
                  <th className="pb-2 text-right">Revenue Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashierStats.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-700">{c.ordersProcessed}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
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
