import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Users,
  Save,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Shield,
  Smartphone,
  QrCode,
} from 'lucide-react';
import apiClient from '../../api/client';
import { User } from '../../types';

interface StoreSettingsData {
  maxQueuePerLane: number;
  defaultEstimatedWaitPerCustomerMinutes: number;
  autoAssignCounter: boolean;
  enableNfc: boolean;
  enableQr: boolean;
  businessHours?: {
    open: string;
    close: string;
  };
}

export const SettingsPage: React.FC = () => {
  const [storeId, setStoreId] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('SmartQueue Supermarket');
  const [settings, setSettings] = useState<StoreSettingsData>({
    maxQueuePerLane: 15,
    defaultEstimatedWaitPerCustomerMinutes: 2.5,
    autoAssignCounter: true,
    enableNfc: true,
    enableQr: true,
    businessHours: { open: '08:00', close: '22:00' },
  });

  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CASHIER',
  });

  // Load initial settings and staff
  const loadData = async () => {
    try {
      setLoading(true);
      const [storesRes, usersRes] = await Promise.all([
        apiClient.get('/stores').catch(() => null),
        apiClient.get('/users').catch(() => null),
      ]);

      if (storesRes?.data?.success && storesRes.data.data.length > 0) {
        const store = storesRes.data.data[0];
        setStoreId(store._id || store.id);
        setStoreName(store.name);

        const settingsRes = await apiClient.get(`/stores/${store._id || store.id}/settings`).catch(() => null);
        if (settingsRes?.data?.success) {
          setSettings(settingsRes.data.data);
        }
      }

      if (usersRes?.data?.success) {
        setStaffList(usersRes.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    try {
      setStatusMessage(null);
      setErrorMessage(null);

      const res = await apiClient.put(`/stores/${storeId}/settings`, settings);
      if (res.data.success) {
        setStatusMessage('Store operating parameters saved successfully.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMessage(errorObj.response?.data?.error || errorObj.message || 'Failed to save store settings.');
    }
  };

  // Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      const res = await apiClient.post('/users', {
        ...newStaffForm,
        storeId: storeId || undefined,
      });

      if (res.data.success) {
        setShowAddStaffModal(false);
        setNewStaffForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'CASHIER',
        });
        setStatusMessage('Employee account registered successfully.');
        loadData();
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMessage(errorObj.response?.data?.error || errorObj.message || 'Failed to register employee.');
    }
  };

  // Toggle user active status
  const handleToggleStaffStatus = async (userId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/status`);
      loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">System & Supermarket Settings</h1>
          <p className="text-sm text-slate-500">Configure supermarket rules, queue parameters, and manage staff accounts</p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Operating Rules Form */}
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Store Parameters ({storeName})</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">STORE-001</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Max Queue Per Lane
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxQueuePerLane}
                onChange={(e) =>
                  setSettings({ ...settings, maxQueuePerLane: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Avg Service Benchmark (Mins)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={settings.defaultEstimatedWaitPerCustomerMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultEstimatedWaitPerCustomerMinutes: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">NFC Entrance Tap-In</div>
                  <div className="text-[11px] text-slate-500">Allow customers to check in via NFC shelf tags</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNfc}
                onChange={(e) => setSettings({ ...settings, enableNfc: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">QR Code Gate Entry</div>
                  <div className="text-[11px] text-slate-500">Allow shoppers to join queue by scanning entry QR</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableQr}
                onChange={(e) => setSettings({ ...settings, enableQr: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Autonomous Counter Balancing</div>
                  <div className="text-[11px] text-slate-500">Auto-route express customers to lowest wait lane</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignCounter}
                onChange={(e) => setSettings({ ...settings, autoAssignCounter: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Supermarket Parameters</span>
            </button>
          </div>
        </form>

        {/* Staff Management */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-800">Employee & Staff Directory</h2>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[340px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading staff...</div>
              ) : staffList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No staff accounts found.</div>
              ) : (
                staffList.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{user.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {user.email} • <span className="font-mono text-purple-600">{user.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleStaffStatus(user._id || user.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            Cashiers can sign in at the checkout terminal; managers can view analytics.
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register Staff Member</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="cashier@smartqueue.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role *</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                >
                  <option value="CASHIER">Cashier (Checkout Lanes)</option>
                  <option value="MANAGER">Store Manager (Operations)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
