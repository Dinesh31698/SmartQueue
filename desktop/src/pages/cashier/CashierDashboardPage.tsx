import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Counter, QueueEntry, Product } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Bell,
  CheckCircle2,
  Play,
  SkipForward,
  Store,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  X,
  Search,
  Sparkles
} from 'lucide-react';
import apiClient from '../../api/client';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface BillItem {
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface ReceiptData {
  store: { name?: string; address?: string; contactNumber?: string };
  orderNumber: string;
  transactionId: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  finalTotal: number;
  paymentMethod: string;
  customerName: string;
  date: string;
}

export const CashierDashboardPage: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [activeCounter, setActiveCounter] = useState<Counter | null>(null);

  const [waitingQueue, setWaitingQueue] = useState<QueueEntry[]>([]);
  const [currentTicket, setCurrentTicket] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // POS Billing State
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [completedReceipt, setCompletedReceipt] = useState<ReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const { socket } = useSocket();

  // Load counters and live queue status
  const fetchCountersAndQueue = async () => {
    try {
      setLoading(true);
      const [countersRes, queueRes] = await Promise.all([
        apiClient.get('/counters'),
        apiClient.get('/queue/status'),
      ]);

      if (countersRes.data.success) {
        const list: Counter[] = countersRes.data.data || [];
        setCounters(list);
        if (list.length > 0 && !selectedCounterId) {
          const firstOpen = list.find((c) => c.status === 'OPEN') || list[0];
          setSelectedCounterId(firstOpen._id || firstOpen.id);
          setActiveCounter(firstOpen);
        }
      }

      if (queueRes.data.success) {
        const overview = queueRes.data.data;
        const serving = overview.currentlyServing || [];
        if (serving.length > 0) {
          setCurrentTicket(serving[0]);
        }
      }

      // Fetch public display for list of waiting tickets
      const displayRes = await apiClient.get('/queue/display');
      if (displayRes.data.success) {
        const nextWaiting = displayRes.data.data.nextInLine || [];
        setWaitingQueue(
          nextWaiting.map((item: { ticketNumber: string; estimatedWaitMinutes: number }, idx: number) => ({
            id: `wait-${idx}`,
            storeId: 'STORE-001',
            customerId: 'Customer',
            ticketNumber: item.ticketNumber,
            status: 'WAITING',
            estimatedWaitMinutes: item.estimatedWaitMinutes,
            createdAt: new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load cashier data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountersAndQueue();
  }, []);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('queue_updated', () => {
      fetchCountersAndQueue();
    });

    socket.on('customer_called', (data) => {
      console.log('Customer called event:', data);
    });

    return () => {
      socket.off('queue_updated');
      socket.off('customer_called');
    };
  }, [socket]);

  // Handle counter selection / claim
  const handleClaimCounter = async (counterId: string) => {
    try {
      setSelectedCounterId(counterId);
      const res = await apiClient.post(`/counters/${counterId}/assign`);
      if (res.data.success) {
        setActiveCounter(res.data.data);
      }
    } catch (err) {
      console.error('Error claiming counter:', err);
    }
  };

  // Call Next Waiting Customer
  const handleCallNext = async () => {
    try {
      setBillingError(null);
      const res = await apiClient.post('/queue/call-next', {
        counterId: selectedCounterId,
      });

      if (res.data.success && res.data.data) {
        const { ticket, counter } = res.data.data;
        setCurrentTicket(ticket);
        setActiveCounter(counter);
        setWaitingQueue((prev) => prev.filter((t) => t.ticketNumber !== ticket.ticketNumber));
      } else {
        setBillingError('No customers waiting in queue.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setBillingError(errorObj.response?.data?.error || 'Failed to call next customer.');
    }
  };

  // Start Serving
  const handleStartServing = async () => {
    if (!currentTicket) return;
    try {
      const ticketId = currentTicket._id || currentTicket.id;
      const res = await apiClient.post(`/queue/ticket/${ticketId}/serve`);
      if (res.data.success) {
        setCurrentTicket({ ...currentTicket, status: 'SERVING' });
      }
    } catch {
      setCurrentTicket({ ...currentTicket, status: 'SERVING' });
    }
  };

  // Skip Customer
  const handleSkipCustomer = async () => {
    if (!currentTicket) return;
    try {
      const ticketId = currentTicket._id || currentTicket.id;
      await apiClient.post(`/queue/ticket/${ticketId}/skip`);
      setCurrentTicket(null);
      setBillItems([]);
    } catch (err) {
      console.error(err);
      setCurrentTicket(null);
      setBillItems([]);
    }
  };

  // Complete Customer without checkout
  const handleCompleteService = async () => {
    if (!currentTicket) return;
    try {
      const ticketId = currentTicket._id || currentTicket.id;
      await apiClient.post(`/queue/ticket/${ticketId}/complete`);
      setCurrentTicket(null);
      setBillItems([]);
    } catch (err) {
      console.error(err);
      setCurrentTicket(null);
      setBillItems([]);
    }
  };

  // Scan or add item to live bill by Barcode
  const handleScanBarcode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    setBillingError(null);
    try {
      const res = await apiClient.get(`/products/barcode/${barcodeInput.trim()}`);
      if (res.data.success) {
        const product: Product = res.data.data;
        const prodId = product._id || product.id;

        setBillItems((prev) => {
          const existing = prev.find((i) => i.productId === prodId);
          if (existing) {
            return prev.map((i) =>
              i.productId === prodId
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                    subtotal: Math.round((i.quantity + 1) * i.price * 100) / 100,
                  }
                : i
            );
          } else {
            return [
              ...prev,
              {
                productId: prodId,
                name: product.name,
                barcode: product.barcode,
                price: product.price,
                quantity: 1,
                subtotal: product.price,
              },
            ];
          }
        });

        setBarcodeInput('');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setBillingError(errorObj.response?.data?.error || `Product with barcode "${barcodeInput}" not found.`);
    }
  };

  // Update item quantity
  const updateItemQty = (productId: string, delta: number) => {
    setBillItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              subtotal: Math.round(newQty * item.price * 100) / 100,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setBillItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Bill totals
  const subtotal = billItems.reduce((acc, i) => acc + i.subtotal, 0);
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const discountAmount = 0;
  const grandTotal = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

  // Process Payment & Complete
  const handleProcessPayment = async (method: 'CASH' | 'CARD' | 'UPI' | 'SIMULATED_TEST') => {
    if (billItems.length === 0) {
      setBillingError('Cannot process checkout with an empty billing list.');
      return;
    }

    setIsProcessingPayment(true);
    setBillingError(null);

    try {
      // 1. Create order
      const orderRes = await apiClient.post('/orders', {
        items: billItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: method,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.error || 'Failed to generate order.');
      }

      const order = orderRes.data.data;
      const orderId = order._id || order.id;

      // 2. Process payment
      const paymentRes = await apiClient.post('/payment/process', {
        orderId,
        method,
        amountPaid: grandTotal,
      });

      if (paymentRes.data.success) {
        const receipt = paymentRes.data.data.receipt;
        setCompletedReceipt(receipt);
        setShowReceiptModal(true);

        // 3. Complete ticket if currently serving one
        if (currentTicket) {
          const ticketId = currentTicket._id || currentTicket.id;
          await apiClient.post(`/queue/ticket/${ticketId}/complete`).catch(() => {});
          setCurrentTicket(null);
        }

        // Reset billing terminal
        setBillItems([]);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setBillingError(errorObj.response?.data?.error || errorObj.message || 'Payment processing failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getCustomerName = (ticket: QueueEntry | null) => {
    if (!ticket) return 'Walk-in Shopper';
    if (typeof ticket.customerId === 'object' && ticket.customerId?.name) {
      return ticket.customerId.name;
    }
    return ticket.customerName || 'Shopper';
  };

  return (
    <div className="space-y-6">
      {/* Station Header */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[9px] flex items-center justify-center">
              <Store className="w-5 h-5 text-[#007AB7]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-black text-white tracking-tight uppercase">
                POS Lane <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Terminal</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              High-Velocity Barcode Scanning, Instant Verification & Fiscal Invoicing
            </p>
          </div>
        </div>

        {/* Counter Selection */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono font-semibold text-slate-400">Checkout Lane:</label>
          <select
            value={selectedCounterId}
            onChange={(e) => handleClaimCounter(e.target.value)}
            className="px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-[#007AB7]"
          >
            {counters.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name || `Counter ${c.counterNumber}`} ({c.acceptedPaymentType})
              </option>
            ))}
          </select>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border ${
              activeCounter?.status === 'OPEN'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : activeCounter?.status === 'BUSY'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-white/10'
            }`}
          >
            {activeCounter?.status || 'ONLINE'}
          </span>
        </div>
      </div>

      {billingError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>{billingError}</span>
          <button onClick={() => setBillingError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Currently Serving + Queue Dispatcher */}
        <div className="space-y-6 lg:col-span-1">
          {/* Currently Serving Box */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Currently Serving
                </h2>
                {currentTicket && <StatusBadge status={currentTicket.status} />}
              </div>

              {currentTicket ? (
                <div className="py-6 text-center space-y-2">
                  <div className="text-5xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#007AB7] drop-shadow-[0_0_20px_rgba(0,122,183,0.4)]">
                    {currentTicket.ticketNumber}
                  </div>
                  <div className="font-heading font-bold text-white text-base">{getCustomerName(currentTicket)}</div>
                  <div className="text-xs font-mono text-[#007AB7]">Status: {currentTicket.status}</div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500 space-y-1">
                  <div className="text-sm font-heading font-medium text-slate-400">Station Idle</div>
                  <div className="text-xs font-mono text-slate-600">Call next ticket to begin transaction</div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              {!currentTicket ? (
                <button
                  onClick={handleCallNext}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue hover:brightness-110 transition"
                >
                  <Bell className="w-4 h-4 text-white" />
                  <span>Call Next Shopper ({waitingQueue.length} Waiting)</span>
                </button>
              ) : currentTicket.status === 'CALLED' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleStartServing}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF2D95] to-[#cc2477] text-white font-semibold text-xs font-mono flex items-center justify-center gap-1.5 shadow-glow-rose hover:brightness-110 transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Billing</span>
                  </button>
                  <button
                    onClick={handleSkipCustomer}
                    className="py-2.5 px-3 rounded-xl bg-[#171A21] hover:bg-[#20242D] text-amber-400 border border-amber-500/30 font-semibold text-xs font-mono flex items-center justify-center gap-1.5 transition"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip Ticket</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCompleteService}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#171A21] hover:bg-[#20242D] border border-white/10 text-slate-200 font-semibold text-xs font-mono flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Finish & Clear Station</span>
                </button>
              )}
            </div>
          </div>

          {/* Waiting Queue List */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Next In Line</h2>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-mono font-bold border border-amber-500/30">
                {waitingQueue.length}
              </span>
            </div>

            <div className="mt-3 max-h-52 overflow-y-auto space-y-2">
              {loading ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500">Loading queue feed...</div>
              ) : waitingQueue.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500">No customers currently waiting.</div>
              ) : (
                waitingQueue.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#111318] border border-white/5 text-xs font-mono">
                    <span className="font-bold text-white tracking-wider">{item.ticketNumber}</span>
                    <span className="text-slate-400">~{item.estimatedWaitMinutes || 3} mins</span>
                    <span className="text-amber-400 text-[10px] font-semibold">WAITING</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: POS Scanning & Billing Terminal */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            {/* Barcode Scanner Form */}
            <form onSubmit={handleScanBarcode} className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute left-3.5 top-3 text-[#007AB7]" />
                <input
                  type="text"
                  placeholder="Scan barcode or enter SKU code (e.g. 8901262010114)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#111318] border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#007AB7] focus:ring-1 focus:ring-[#007AB7]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 shadow-glow-blue hover:brightness-110 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </form>

            {/* Billing Items Table */}
            <div className="mt-4 overflow-x-auto min-h-[220px]">
              {billItems.length === 0 ? (
                <div className="py-14 text-center text-slate-500">
                  <Barcode className="w-10 h-10 mx-auto opacity-30 text-[#007AB7] mb-2" />
                  <div className="text-sm font-heading font-medium text-slate-400">Terminal Cart Empty</div>
                  <div className="text-xs font-mono text-slate-600 mt-1">Scan items or type barcodes to build live customer bill.</div>
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                      <th className="pb-2.5 font-semibold">Item Description</th>
                      <th className="pb-2.5 font-semibold">Barcode</th>
                      <th className="pb-2.5 text-right font-semibold">Unit Price</th>
                      <th className="pb-2.5 text-center font-semibold">Qty</th>
                      <th className="pb-2.5 text-right font-semibold">Subtotal</th>
                      <th className="pb-2.5 text-right font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {billItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-white/5 transition">
                        <td className="py-2.5 font-medium text-white">{item.name}</td>
                        <td className="py-2.5 text-slate-400">{item.barcode}</td>
                        <td className="py-2.5 text-right text-slate-300">{formatCurrency(item.price)}</td>
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-2 border border-white/10 bg-[#111318] rounded-lg px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.productId, -1)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white px-1">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.productId, 1)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-bold text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Checkout Totals & Payment Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between text-xs">
              <span className="text-slate-400">Total Units: {billItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
              <div className="space-x-4 text-right">
                <span className="text-slate-400">Subtotal: {formatCurrency(subtotal)}</span>
                <span className="text-slate-400">Tax (5%): {formatCurrency(taxAmount)}</span>
                <span className="text-base sm:text-lg font-black text-white ml-3">
                  Grand Total: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">{formatCurrency(grandTotal)}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleProcessPayment('CASH')}
                disabled={billItems.length === 0 || isProcessingPayment}
                className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Pay Cash</span>
              </button>

              <button
                type="button"
                onClick={() => handleProcessPayment('CARD')}
                disabled={billItems.length === 0 || isProcessingPayment}
                className="py-2.5 px-3 rounded-xl bg-[#007AB7]/20 hover:bg-[#007AB7]/30 border border-[#007AB7]/40 text-[#38BDF8] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-glow-blue transition disabled:opacity-40"
              >
                <CreditCard className="w-4 h-4 text-[#007AB7]" />
                <span>Card (POS)</span>
              </button>

              <button
                type="button"
                onClick={() => handleProcessPayment('UPI')}
                disabled={billItems.length === 0 || isProcessingPayment}
                className="py-2.5 px-3 rounded-xl bg-[#FF2D95]/20 hover:bg-[#FF2D95]/30 border border-[#FF2D95]/40 text-[#FF2D95] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-glow-rose transition disabled:opacity-40"
              >
                <Smartphone className="w-4 h-4 text-[#FF2D95]" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => handleProcessPayment('SIMULATED_TEST')}
                disabled={billItems.length === 0 || isProcessingPayment}
                className="py-2.5 px-3 rounded-xl bg-[#111318] hover:bg-[#171A21] border border-white/10 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-[#007AB7]" />
                <span>Simulate Pay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {showReceiptModal && completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-glow-dual space-y-4 border border-[#007AB7]/40">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>TRANSACTION SETTLED</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <h3 className="text-lg font-heading font-black text-white">{completedReceipt.store?.name || 'SmartQueue Supermarket'}</h3>
              <p className="text-xs text-slate-400 font-mono">{completedReceipt.store?.address || 'Flagship Superstore'}</p>
              <div className="font-mono text-xs font-bold text-[#007AB7] mt-2">
                Order #{completedReceipt.orderNumber}
              </div>
              <div className="font-mono text-[11px] text-slate-500">
                Txn: {completedReceipt.transactionId}
              </div>
            </div>

            <div className="border-t border-b border-dashed border-white/20 py-3 space-y-2 text-xs font-mono">
              {completedReceipt.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-300">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-white">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(completedReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (5%):</span>
                <span>{formatCurrency(completedReceipt.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Paid:</span>
                <span className="text-emerald-400 font-black">{formatCurrency(completedReceipt.finalTotal)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Method: {completedReceipt.paymentMethod}</span>
                <span>{formatDateTime(completedReceipt.date)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl border border-white/10 text-slate-200 font-mono font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white font-mono font-semibold text-xs shadow-glow-blue hover:brightness-110 transition"
              >
                Close & Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};