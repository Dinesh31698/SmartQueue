# SmartQueue — Desktop Web Application (React + TypeScript)

The Desktop Web Application is built with React 18, TypeScript, and Vite. It serves supermarket employees across three distinct roles: Cashiers, Store Managers, and System Administrators.

---

## 1. Application Architecture
- **Bundler & Tooling**: Vite with TypeScript (`@vitejs/plugin-react`)
- **Routing**: React Router v6 with `ProtectedRoute` guards verifying roles and JWT authentication
- **State Management**:
  - `AuthContext`: Manages current user session, token storage, and login/logout lifecycles.
  - `SocketContext`: Manages persistent WebSocket connection to backend with auto-reconnection.
  - TanStack Query / Axios for server state management.
- **Styling**: Clean, maintainable responsive CSS module system and Tailwind utilities.
- **Analytics Visuals**: Recharts for interactive revenue, order volume, and queue throughput visualization.

---

## 2. Role Modules & Routes

### A. Cashier Station (`/cashier`)
- Counter selection and status toggle (`OPEN`, `BUSY`, `CLOSED`).
- Real-time customer queue viewer (Waiting tickets, customer names, payment method).
- Actions: **Call Customer**, **Start Processing**, **Verify Order & Items**, **Bill & Complete Transaction**, **Skip Customer**.
- Live Socket.IO listener for immediate queue updates when customers join or leave.

### B. Manager Operations (`/manager`)
- Real-time KPI cards: Daily Revenue, Total Orders, Active Queues, Waiting Count, Active Counters.
- Live Lane Monitor: Status and queue length across all checkout counters.
- Inventory & Catalog Management: Product table, low-stock notifications, price/stock quick edits.
- Cashier Throughput Performance: Service time per cashier and ticket volume.

### C. System Administration (`/admin`)
- Multi-store management and configuration.
- Employee account provisioning (assigning Cashier or Manager roles).
- Audit logs and system health diagnostics.
- Global queue algorithm settings (e.g., maximum queue depth per lane, buffer limits).
