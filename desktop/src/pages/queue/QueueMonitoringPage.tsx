import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Users, Clock, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { Counter } from '../../types';
import { useSocket } from '../../contexts/SocketContext';

interface DisplayServing {
  ticketNumber: string;
  counterNumber: string;
  counterName: string;
  status: string;
}

interface DisplayWaiting {
  ticketNumber: string;
  estimatedWaitMinutes: number;
}

export const QueueMonitoringPage: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [nowServing, setNowServing] = useState<DisplayServing[]>([]);
  const [nextInLine, setNextInLine] = useState<DisplayWaiting[]>([]);
  const [avgWait, setAvgWait] = useState<number>(3);
  const [totalWaiting, setTotalWaiting] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket();

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const [statusRes, countersRes, displayRes] = await Promise.all([
        apiClient.get('/queue/status').catch(() => null),
        apiClient.get('/counters').catch(() => null),
        apiClient.get('/queue/display').catch(() => null),
      ]);

      if (statusRes?.data?.success) {
        setTotalWaiting(statusRes.data.data.totalWaiting || 0);
        setAvgWait(statusRes.data.data.avgWaitMinutes || 3);
      }

      if (countersRes?.data?.success) {
        setCounters(countersRes.data.data || []);
      }

      if (displayRes?.data?.success) {
        setNowServing(displayRes.data.data.nowServing || []);
        setNextInLine(displayRes.data.data.nextInLine || []);
      }
    } catch (err) {
      console.error('Error loading queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  // Socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on('queue_updated', () => fetchQueueData());
    socket.on('customer_called', () => fetchQueueData());
    socket.on('counter_status_changed', () => fetchQueueData());
    return () => {
      socket.off('queue_updated');
      socket.off('customer_called');
      socket.off('counter_status_changed');
    };
  }, [socket]);

  // Toggle counter status (Open / Closed)
  const handleToggleCounterStatus = async (counterId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
    try {
      await apiClient.patch(`/counters/${counterId}/status`, { status: newStatus });
      fetchQueueData();
    } catch (err) {
      console.error('Error toggling counter status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Live Supermarket Queue & Counter Dispatcher</h1>
            <p className="text-sm text-slate-500">Real-time lane load, ticket sequencing, and lane status management</p>
          </div>
        </div>

        <button
          onClick={fetchQueueData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Waiting</span>
            <div className="text-3xl font-black text-slate-900 font-mono mt-1">{totalWaiting} Shoppers</div>
            <p className="text-xs text-slate-500 mt-1">Across all registered checkout lanes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Est. Average Wait</span>
            <div className="text-3xl font-black text-slate-900 font-mono mt-1">~{avgWait} Mins</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Dynamic AI Queue Prediction</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Serving Lanes</span>
            <div className="text-3xl font-black text-emerald-600 font-mono mt-1">
              {counters.filter((c) => c.status !== 'CLOSED').length} / {counters.length} Active
            </div>
            <p className="text-xs text-slate-500 mt-1">Cashier & automated lanes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Counter Lanes Dispatch Management */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Checkout Counters & Lane Controls
          </h2>

          <div className="space-y-3">
            {counters.map((c) => {
              const cashierName =
                typeof c.assignedCashierId === 'object' && c.assignedCashierId?.name
                  ? c.assignedCashierId.name
                  : 'Unassigned';

              const isOpen = c.status === 'OPEN' || c.status === 'BUSY';

              return (
                <div
                  key={c._id || c.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      {c.name || `Counter ${c.counterNumber}`}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Cashier: <span className="font-medium text-slate-700">{cashierName}</span> • Type: {c.acceptedPaymentType}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        c.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'BUSY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>

                    <button
                      onClick={() => handleToggleCounterStatus(c._id || c.id, c.status)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      {isOpen ? 'Close' : 'Open'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Board Screen Preview */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Store Public Display Feed
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">LIVE SCREEN</span>
            </div>

            {/* Now Serving */}
            <div className="mt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Now Serving</span>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {nowServing.length === 0 ? (
                  <div className="col-span-2 p-4 text-center text-xs text-slate-500 bg-slate-800/50 rounded-xl">
                    Counters are preparing to call next tickets.
                  </div>
                ) : (
                  nowServing.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                      <div className="text-2xl font-black font-mono text-emerald-400">{item.ticketNumber}</div>
                      <div className="text-xs text-slate-400 mt-1">To {item.counterName}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Next in Line */}
            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next In Line</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {nextInLine.length === 0 ? (
                  <span className="text-xs text-slate-500">No tickets waiting</span>
                ) : (
                  nextInLine.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-200"
                    >
                      {item.ticketNumber}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>SmartQueue Autonomous Dispatcher</span>
            <span>Refreshes via WebSockets</span>
          </div>
        </div>
      </div>
    </div>
  );
};
