import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Order } from '../../types';
import apiClient from '../../api/client';
import { Search, Filter, RefreshCw, X, Receipt, Printer, Eye, ShoppingBag } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders', {
        params: {
          status: statusFilter || undefined,
          search: searchTerm || undefined,
          limit: 50,
        },
      });

      if (res.data.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Socket update
  useEffect(() => {
    if (!socket) return;
    socket.on('order_status_updated', () => fetchOrders());
    return () => {
      socket.off('order_status_updated');
    };
  }, [socket]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getCustomerName = (order: Order) => {
    if (typeof order.customerId === 'object' && order.customerId?.name) {
      return order.customerId.name;
    }
    return order.customerName || 'Walk-in Shopper';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-[#FF2D95]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF2D95] font-semibold">
              TRANSACTION AUDIT LEDGER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Orders</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Audit in-store checkouts, digital receipts, and real-time fiscal transactions.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#007AB7] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-4 justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#007AB7]" />
          <input
            type="text"
            placeholder="Search order number (e.g. ORD-20261103)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111318] border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#007AB7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 bg-[#111318] focus:outline-none focus:border-[#007AB7]"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#171A21] hover:bg-[#20242D] border border-white/10 text-white rounded-xl text-xs font-mono font-semibold transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500">Querying transaction database...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-sm font-heading font-medium text-slate-400">No Orders Logged</div>
            <div className="text-xs font-mono text-slate-600 mt-1">Processed checkout bills will stream here in real time.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#07080B] border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cart Units</th>
                  <th className="py-3 px-4 text-right">Order Total</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => {
                  const total = ord.finalTotal !== undefined ? ord.finalTotal : ord.totalAmount || 0;
                  const itemsCount = ord.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

                  return (
                    <tr key={ord._id || ord.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-[#007AB7]">{ord.orderNumber}</td>
                      <td className="py-3.5 px-4 text-white font-medium">{getCustomerName(ord)}</td>
                      <td className="py-3.5 px-4 text-slate-400">{itemsCount} items</td>
                      <td className="py-3.5 px-4 font-bold text-white text-right">{formatCurrency(total)}</td>
                      <td className="py-3.5 px-4 text-slate-400">{ord.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDateTime(ord.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.orderStatus || 'COMPLETED'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#007AB7]/10 hover:bg-[#007AB7]/20 border border-[#007AB7]/30 text-[#38BDF8] text-xs font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 shadow-glow-dual border border-[#007AB7]/40 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#007AB7]" />
                <h3 className="text-sm font-heading font-black text-white uppercase">
                  Order Details — {selectedOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#111318] p-3.5 rounded-xl border border-white/5">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Customer</span>
                <span className="font-semibold text-white">{getCustomerName(selectedOrder)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Placed Date</span>
                <span className="font-semibold text-white">{formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-500 block text-[10px] uppercase">Payment Method</span>
                <span className="font-semibold text-white">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-500 block text-[10px] uppercase">Payment Status</span>
                <span className="font-semibold text-emerald-400">{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#07080B] border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedOrder.items?.map((item, idx) => {
                    const itemName =
                      typeof item.productId === 'object' && item.productId?.name
                        ? item.productId.name
                        : item.name || 'Product';
                    return (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2.5 text-white">{itemName}</td>
                        <td className="p-2.5 text-center text-slate-300">{item.quantity}</td>
                        <td className="p-2.5 text-right text-slate-400">{formatCurrency(item.price)}</td>
                        <td className="p-2.5 text-right font-bold text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-white/10">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (5%):</span>
                <span>{formatCurrency(selectedOrder.taxAmount || selectedOrder.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-black">
                  {formatCurrency(selectedOrder.finalTotal || selectedOrder.totalAmount || 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl text-xs font-semibold shadow-glow-blue hover:brightness-110 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};