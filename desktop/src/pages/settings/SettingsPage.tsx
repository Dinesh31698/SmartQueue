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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007AB7] to-[#FF2D95] p-0.5 shadow-glow-dual flex items-center justify-center">
          <div className="w-full h-full bg-[#0A0A0A] rounded-[9px] flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight uppercase">
            System & Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AB7] to-[#FF2D95]">Parameters</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure supermarket rules, virtual queue thresholds, and authenticated staff credentials.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Operating Rules Form */}
        <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#007AB7]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Store Rules ({storeName})</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">STORE-001</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">
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
                className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#007AB7]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">
                Avg Benchmark (Mins)
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
                className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#007AB7]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#111318] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-[#007AB7]" />
                <div>
                  <div className="font-bold text-white">NFC Entrance Tap-In</div>
                  <div className="text-[10px] text-slate-400">Allow customers to check in via NFC shelf tags</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNfc}
                onChange={(e) => setSettings({ ...settings, enableNfc: e.target.checked })}
                className="rounded bg-[#07080B] border-white/20 text-[#007AB7] focus:ring-[#007AB7]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#111318] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <QrCode className="w-4 h-4 text-[#FF2D95]" />
                <div>
                  <div className="font-bold text-white">QR Code Gate Entry</div>
                  <div className="text-[10px] text-slate-400">Allow shoppers to join queue by scanning entrance QR</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableQr}
                onChange={(e) => setSettings({ ...settings, enableQr: e.target.checked })}
                className="rounded bg-[#07080B] border-white/20 text-[#FF2D95] focus:ring-[#FF2D95]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#111318] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#007AB7]" />
                <div>
                  <div className="font-bold text-white">Autonomous Counter Balancing</div>
                  <div className="text-[10px] text-slate-400">Auto-route shoppers to lowest-latency cashier lane</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignCounter}
                onChange={(e) => setSettings({ ...settings, autoAssignCounter: e.target.checked })}
                className="rounded bg-[#07080B] border-white/20 text-[#007AB7] focus:ring-[#007AB7]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-blue hover:brightness-110 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Supermarket Parameters</span>
            </button>
          </div>
        </form>

        {/* Staff Management */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF2D95]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Employee Directory</h2>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#FF2D95] to-[#cc2477] text-white rounded-xl text-xs font-semibold shadow-glow-rose hover:brightness-110 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[340px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Querying employee roster...</div>
              ) : staffList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No staff accounts found.</div>
              ) : (
                staffList.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="p-3 rounded-xl border border-white/5 hover:border-white/10 bg-[#111318] flex items-center justify-between transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {user.email} • <span className={user.role === 'ADMIN' ? 'text-[#FF2D95]' : 'text-[#007AB7]'}>{user.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleStaffStatus(user._id || user.id)}
                        className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-3 border-t border-white/10">
            Cashiers authenticate at POS lanes; store managers access analytics and queue matrices.
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-sm w-full p-6 shadow-glow-dual border border-[#007AB7]/40 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-heading font-black text-white uppercase">Register Employee Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="cashier@smartqueue.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Access Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role Assignment *</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111318] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#007AB7]"
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
                  className="flex-1 py-2.5 px-3 bg-[#111318] hover:bg-[#171A21] border border-white/10 rounded-xl text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#007AB7] to-[#005a87] text-white rounded-xl font-semibold shadow-glow-blue hover:brightness-110 transition"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};