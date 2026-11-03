import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Order } from '../../types';
import apiClient from '../../api/client';
import { Search, Filter, RefreshCw, X, Receipt, Printer, Eye } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

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
          <h1 className="text-xl font-bold text-slate-900">Customer Orders & Transactions</h1>
          <p className="text-sm text-slate-500">Audit in-store checkouts, digital receipts, and billing history</p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order number (e.g. ORD-20261103)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-sm font-medium">No orders recorded</div>
            <div className="text-xs mt-1">Processed checkout bills will appear here in real time.</div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => {
                const total = ord.finalTotal !== undefined ? ord.finalTotal : ord.totalAmount || 0;
                const itemsCount = ord.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

                return (
                  <tr key={ord._id || ord.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{getCustomerName(ord)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{itemsCount} items</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(total)}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{ord.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{formatDateTime(ord.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          ord.orderStatus === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
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
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Order Details — {selectedOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-slate-800">{getCustomerName(selectedOrder)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Placed Date</span>
                <span className="font-semibold text-slate-800">{formatDateTime(selectedOrder.createdAt)}</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-semibold text-slate-800">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-400 block">Payment Status</span>
                <span className="font-semibold text-emerald-700">{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="border border-slate-100 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => {
                    const itemName =
                      typeof item.productId === 'object' && item.productId?.name
                        ? item.productId.name
                        : item.name || 'Product';
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-800">{itemName}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right text-slate-600">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-right font-semibold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (5%):</span>
                <span>{formatCurrency(selectedOrder.taxAmount || selectedOrder.tax || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-black">
                  {formatCurrency(selectedOrder.finalTotal || selectedOrder.totalAmount || 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
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
