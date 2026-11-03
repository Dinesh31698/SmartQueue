import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Users, Clock, CheckCircle, Radio } from 'lucide-react';
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-[#007AB7]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#007AB7] font-semibold">
              DYNAMIC QUEUE ORCHESTRATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            Live Queue & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Counter Dispatch</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time lane load, ticket sequencing, and autonomous queue balancing.
          </p>
        </div>

        <button
          onClick={fetchQueueData}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#007AB7] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Waiting</span>
            <div className="text-3xl font-black text-white font-mono mt-1">{totalWaiting} Shoppers</div>
            <p className="text-xs text-slate-500 font-mono mt-1">Across all registered checkout lanes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Est. Average Wait</span>
            <div className="text-3xl font-black text-[#007AB7] font-mono mt-1">~{avgWait} Mins</div>
            <p className="text-xs text-emerald-400 font-mono mt-1 font-medium">Dynamic AI Queue Balancing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#007AB7]/20 border border-[#007AB7]/30 text-[#007AB7] flex items-center justify-center shadow-glow-blue">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Operational Lanes</span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {counters.filter((c) => c.status !== 'CLOSED').length} / {counters.length} Active
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">Cashier & automated lanes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Counter Lanes Dispatch Management */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Checkout Counters & Lane Controls
            </h2>
            <span className="text-[10px] font-mono text-[#007AB7] px-2 py-0.5 rounded bg-[#007AB7]/10 border border-[#007AB7]/30">
              HARDWARE MATRIX
            </span>
          </div>

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
                  className="p-3.5 bg-[#111318] rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition font-mono"
                >
                  <div>
                    <div className="font-heading font-bold text-white text-sm">
                      {c.name || `Counter ${c.counterNumber}`}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Cashier: <span className="font-medium text-slate-200">{cashierName}</span> • Type: {c.acceptedPaymentType}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        c.status === 'OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : c.status === 'BUSY'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}
                    >
                      {c.status}
                    </span>

                    <button
                      onClick={() => handleToggleCounterStatus(c._id || c.id, c.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                        isOpen
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
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
        <div className="glass-panel p-6 rounded-2xl border border-[#007AB7]/30 shadow-glow-blue flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AB7] animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Store Public Display Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 font-semibold">
                LIVE HUD
              </span>
            </div>

            {/* Now Serving */}
            <div className="mt-5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Now Serving</span>
              </span>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {nowServing.length === 0 ? (
                  <div className="col-span-2 p-5 text-center text-xs font-mono text-slate-500 bg-[#111318] rounded-xl border border-white/5">
                    Checkout stations are calling waiting shoppers.
                  </div>
                ) : (
                  nowServing.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#111318] rounded-2xl border border-emerald-500/30 text-center shadow-sm">
                      <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
                        {item.ticketNumber}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">Proceed to {item.counterName}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Next in Line */}
            <div className="mt-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Next In Line
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {nextInLine.length === 0 ? (
                  <span className="text-xs font-mono text-slate-500">No tickets in waiting sequence</span>
                ) : (
                  nextInLine.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#111318] border border-[#007AB7]/30 font-mono text-xs font-bold text-white shadow-glow-blue"
                    >
                      {item.ticketNumber}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-slate-500 flex justify-between relative z-10">
            <span>Autonomous Queue Dispatcher</span>
            <span className="text-[#007AB7]">WebSocket Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};