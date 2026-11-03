import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, RefreshCw, X, AlertCircle, Package } from 'lucide-react';
import apiClient from '../../api/client';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    barcode: '',
    name: '',
    brand: '',
    categoryId: '',
    price: '',
    costPrice: '',
    initialStock: '100',
    aisleLocation: 'Aisle 1',
    isHealthyPick: false,
    unit: 'item',
  });

  // Restock Modal State
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<string>('50');
  const [restockReason, setRestockReason] = useState<string>('Weekly Restock');

  // Load products and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/products', {
          params: {
            search: searchTerm || undefined,
            categoryId: selectedCategory || undefined,
            limit: 50,
          },
        }),
        apiClient.get('/categories'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products || []);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setError(errorObj.response?.data?.error || errorObj.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await apiClient.post('/products', {
        barcode: addForm.barcode.trim(),
        name: addForm.name.trim(),
        brand: addForm.brand.trim(),
        categoryId: addForm.categoryId || (categories.length > 0 ? categories[0]._id : undefined),
        price: parseFloat(addForm.price),
        costPrice: addForm.costPrice ? parseFloat(addForm.costPrice) : parseFloat(addForm.price) * 0.7,
        initialStock: parseInt(addForm.initialStock, 10) || 50,
        aisleLocation: addForm.aisleLocation,
        isHealthyPick: addForm.isHealthyPick,
        unit: addForm.unit,
      });

      if (res.data.success) {
        setShowAddModal(false);
        setAddForm({
          barcode: '',
          name: '',
          brand: '',
          categoryId: '',
          price: '',
          costPrice: '',
          initialStock: '100',
          aisleLocation: 'Aisle 1',
          isHealthyPick: false,
          unit: 'item',
        });
        fetchData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setError(errorObj.response?.data?.error || errorObj.message || 'Failed to create product');
    }
  };

  // Restock Submit
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;

    try {
      setError(null);
      const res = await apiClient.post('/inventory/restock', {
        productId: restockTarget._id || restockTarget.id,
        quantity: parseInt(restockQty, 10),
        reason: restockReason,
      });

      if (res.data.success) {
        setShowRestockModal(false);
        setRestockTarget(null);
        fetchData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setError(errorObj.response?.data?.error || errorObj.message || 'Failed to restock item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-[#007AB7]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#007AB7] font-semibold">
              CATALOG & STOCK SURVEILLANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            Product <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Shelf telemetry, SKU barcode registrations, and real-time replenishment quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#007AB7] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl text-xs font-mono font-semibold shadow-glow-blue hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register SKU</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Category Filter */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-4 justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#007AB7]" />
          <input
            type="text"
            placeholder="Search SKU name, barcode, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111318] border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-[#007AB7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200 bg-[#111318] focus:outline-none focus:border-[#007AB7]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#171A21] hover:bg-[#20242D] border border-white/10 text-white rounded-xl text-xs font-mono font-semibold transition"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500">Retrieving catalog records...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-sm font-heading font-medium text-slate-400">No SKU Records Located</div>
            <div className="text-xs font-mono text-slate-600 mt-1">Adjust search parameters or click "Register SKU".</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#07080B] border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Barcode / SKU</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Aisle Map</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((item) => {
                  const stock = item.currentStock !== undefined ? item.currentStock : item.stockQuantity || 0;
                  const catName =
                    typeof item.categoryId === 'object' && item.categoryId?.name
                      ? item.categoryId.name
                      : item.category || 'General';

                  return (
                    <tr key={item._id || item.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-[#007AB7]">{item.barcode}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-heading font-bold text-white text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.brand}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{catName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{item.aisleLocation || 'Aisle 1'}</td>
                      <td className="py-3.5 px-4 font-bold text-white text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            stock < 10
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-glow-rose'
                              : stock < 25
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.isHealthyPick && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF2D95]/10 text-[#FF2D95] border border-[#FF2D95]/30">
                            Healthy Pick
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setRestockTarget(item);
                            setShowRestockModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#007AB7]/10 hover:bg-[#007AB7]/20 border border-[#007AB7]/30 text-[#38BDF8] text-xs font-semibold transition"
                        >
                          Restock
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 shadow-glow-blue border border-[#007AB7]/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-heading font-black text-white uppercase">Register New Supermarket SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Barcode (EAN-13 / UPC) *</label>
                  <input
                    type="text"
                    required
                    placeholder="8901262010114"
                    value={addForm.barcode}
                    onChange={(e) => setAddForm({ ...addForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amul / Nestle"
                    value={addForm.brand}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Product Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Amul Taaza Toned Milk 1L"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={addForm.categoryId}
                    onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Aisle Location</label>
                  <input
                    type="text"
                    placeholder="Aisle 2 - Dairy"
                    value={addForm.aisleLocation}
                    onChange={(e) => setAddForm({ ...addForm, aisleLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="74.00"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Initial Stock Intake *</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={addForm.initialStock}
                    onChange={(e) => setAddForm({ ...addForm, initialStock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="healthyCheck"
                  checked={addForm.isHealthyPick}
                  onChange={(e) => setAddForm({ ...addForm, isHealthyPick: e.target.checked })}
                  className="rounded bg-[#111318] border-white/20 text-[#FF2D95] focus:ring-[#FF2D95]"
                />
                <label htmlFor="healthyCheck" className="text-slate-300">
                  Tag as Dietitian-Approved Healthy Pick
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-3 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl font-semibold shadow-glow-blue hover:brightness-110 transition"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-sm w-full p-6 shadow-glow-blue border border-[#007AB7]/40 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-heading font-black text-white uppercase">Restock Product</h3>
              <button onClick={() => setShowRestockModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-heading font-bold text-white text-sm">{restockTarget.name}</div>
              <div className="text-slate-500">{restockTarget.barcode}</div>
              <div className="mt-2 text-emerald-400 font-bold">
                Current stock: {restockTarget.currentStock || restockTarget.stockQuantity || 0} units
              </div>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Units to Add *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Intake Reason</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-2.5 px-3 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl font-semibold shadow-glow-blue hover:brightness-110 transition"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};