import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, RefreshCw, X, AlertCircle } from 'lucide-react';
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
          <h1 className="text-xl font-bold text-slate-900">Inventory & Catalog Management</h1>
          <p className="text-sm text-slate-500">Track shelf stock, barcode registrations, and product pricing</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Category Filter */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, barcode, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none"
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
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-sm font-medium">No products found</div>
            <div className="text-xs mt-1">Try modifying your search or click "Add New Product" to register inventory.</div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Barcode</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Aisle</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((item) => {
                const stock = item.currentStock !== undefined ? item.currentStock : item.stockQuantity || 0;
                const catName =
                  typeof item.categoryId === 'object' && item.categoryId?.name
                    ? item.categoryId.name
                    : item.category || 'General';

                return (
                  <tr key={item._id || item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-bold">{item.barcode}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.brand}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{catName}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">{item.aisleLocation || 'Aisle 1'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(item.price)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          stock < 10
                            ? 'bg-rose-100 text-rose-700'
                            : stock < 25
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {stock} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isHealthyPick && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
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
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register New Supermarket Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Barcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="8901262010114"
                    value={addForm.barcode}
                    onChange={(e) => setAddForm({ ...addForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amul / Nestle"
                    value={addForm.brand}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Amul Taaza Toned Milk 1L"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={addForm.categoryId}
                    onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Aisle Location</label>
                  <input
                    type="text"
                    placeholder="Aisle 2 - Dairy"
                    value={addForm.aisleLocation}
                    onChange={(e) => setAddForm({ ...addForm, aisleLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="74.00"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Stock Intake *</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={addForm.initialStock}
                    onChange={(e) => setAddForm({ ...addForm, initialStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="healthyCheck"
                  checked={addForm.isHealthyPick}
                  onChange={(e) => setAddForm({ ...addForm, isHealthyPick: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="healthyCheck" className="text-xs text-slate-700">
                  Tag as Dietitian-Approved Healthy Pick
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Restock Product</h3>
              <button onClick={() => setShowRestockModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              <div className="font-semibold text-slate-900 text-sm">{restockTarget.name}</div>
              <div className="font-mono text-slate-400 mt-0.5">{restockTarget.barcode}</div>
              <div className="mt-2 text-emerald-700 font-bold">
                Current stock: {restockTarget.currentStock || restockTarget.stockQuantity || 0} units
              </div>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Units to Add *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason / Intake Source</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
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
