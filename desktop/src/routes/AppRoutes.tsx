import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { LoginPage } from '../pages/auth/LoginPage';
import { CashierDashboardPage } from '../pages/cashier/CashierDashboardPage';
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { QueueMonitoringPage } from '../pages/queue/QueueMonitoringPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Cashier Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['CASHIER', 'MANAGER', 'ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/cashier" element={<CashierDashboardPage />} />
        </Route>
      </Route>

      {/* Manager & Admin Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/manager" element={<ManagerDashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/queue" element={<QueueMonitoringPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<ManagerDashboardPage />} />
          <Route path="/users" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Default Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
