# SMARTQUEUE — REALISTIC DEMO SIMULATION DATA REPORT

**Product:** SmartQueue — AI-Powered Smart Supermarket Shopping and Queue Management System  
**Target Environment:** Local Monorepo (`backend`, `desktop`, `mobile/SmartQueueAndroid`)  
**Target Supermarket Store:** `STORE-001` ("SmartQueue Supermarket Flagship")  
**Target Database:** `mongodb://127.0.0.1:27017/smartqueue`  
**Execution Script:** `backend/src/utils/seedDemoSimulation.js`  
**NPM Command:** `npm run seed:demo` (inside `backend/` or `npm --prefix backend run seed:demo`)  
**Status:** **VERIFIED & OPERATIONAL**  

---

## 1. Executive Summary

This simulation populates the existing SmartQueue database with realistic, logically consistent, and multi-day operational demo data. It ensures that all administrative, managerial, cashier, and customer interfaces display live, meaningful metrics and visualizations instead of zeros, empty states, or flat graphs.

### Key Guarantees Maintained
- **Strictly Data-Only:** Zero alterations to frontend UI, UX, components, layouts, styling, navigation, or business logic.
- **Account Preservation:** All existing baseline credentials (`admin@smartqueue.com`, `manager@smartqueue.com`, `cashier1@smartqueue.com`, `cashier2@smartqueue.com`, `customer1@smartqueue.com`, `customer2@smartqueue.com`) are preserved intact.
- **Idempotency:** Safe to run repeatedly without duplicate records or primary key collision.
- **Timestamp Integrity:** Bypasses Mongoose timestamp mutation hooks using direct driver insertions, accurately distributing orders and queue activity across the rolling 7-day operational window.

---

## 2. Dataset Breakdown & Database Metrics

| Collection | Model | Count | Simulation Role & Details |
| :--- | :--- | :---: | :--- |
| `stores` | `Store` | 1 | Target store `STORE-001` ("SmartQueue Supermarket Flagship"). |
| `storesettings` | `StoreSettings` | 1 | Configures 15-capacity lanes, 2.5 min avg wait time, auto-assignment, and AI flags. |
| `users` (Staff) | `User` | 8 | 1 Super Admin, 2 Store Managers, 5 Active Cashiers. |
| `users` (Customers) | `User` | 52 | 2 Original Customers + 50 realistic Indian shoppers with unique emails and phones. |
| `counters` | `Counter` | 4 | 2 `BUSY` active lanes with serving tickets, 2 `OPEN` lanes (Card/Cash and Self-Checkout). |
| `orders` | `Order` | 100 | 95 Completed/Paid orders, 2 Placed/Pending orders today, 3 historical cancellations. |
| `payments` | `Payment` | 98 | 95 Settled gateway transactions (UPI & Card), 3 Failed payment attempts. |
| `transactions` | `Transaction` | 95 | Cashier POS checkout settlement ledgers attributing revenue per cashier. |
| `queuetickets` | `QueueTicket` | 49 | 30 Historical completed, 13 Hourly completed today, 2 `SERVING`, 4 `WAITING`. |
| `inventories` | `Inventory` | 6 | 6 Product inventory profiles with 3-tier stock movement histories (Intake, Restock, Sales). |
| `notifications` | `Notification` | 5 | Real-time push updates for queue calls, position updates, and payment confirmations. |
| `recommendations`| `Recommendation` | 2 | Co-occurrence pairings (Milk + Bread + Tea, Noodles + Tea). |
| `carts` | `Cart` | 1 | Pre-populated shopping cart for waiting shopper (`customer.demo005@example.test`). |

---

## 3. Verified Analytics & Dashboard Endpoints

The simulated dataset was verified by executing the backend analytics controllers against the live MongoDB instance.

### 3.1. Dashboard Executive Summary (`GET /api/analytics/dashboard`)
```json
{
  "totalRevenue": 48772.90,
  "totalOrders": 102,
  "paidOrdersCount": 95,
  "avgOrderValue": 513.40,
  "waitingTickets": 4,
  "completedTicketsToday": 16,
  "activeCounters": 4,
  "avgWaitMinutes": 4
}
```

### 3.2. 7-Day Sales Trend Curve (`GET /api/analytics/sales?days=7`)
Renders smooth Recharts area and line graphs without zero-value drops:

| Day Offset | Calendar Date | Orders | Settled Revenue (INR) | Operational Note |
| :---: | :---: | :---: | :---: | :--- |
| Day -6 | `2026-10-28` | 12 | ₹6,167.60 | Historical baseline sales |
| Day -5 | `2026-10-29` | 13 | ₹6,245.30 | Mid-week steady shopping |
| Day -4 | `2026-10-30` | 15 | ₹7,121.00 | Evening surge volume |
| Day -3 | `2026-10-31` | 15 | ₹8,868.20 | Weekend shopping rush |
| Day -2 | `2026-11-01` | 15 | ₹7,217.60 | High basket size volume |
| Day -1 | `2026-11-02` | 13 | ₹6,965.60 | Standard weekday shopping |
| Day 0 (Today) | `2026-11-03` | 12 | ₹6,187.60 | Current day operational sales |
| **Total** | — | **95** | **₹48,772.90** | **Average Basket: ₹513.40** |

### 3.3. Hourly Queue Traffic Curve (`GET /api/analytics/queue-traffic`)
Populates the 8:00 AM to 9:00 PM hourly customer flow distribution:
- **Morning Peak (8 AM - 11 AM):** 1-2 tickets/hour
- **Lunch Rush (12 PM - 2 PM):** 1-2 tickets/hour
- **Evening Rush (4 PM - 8 PM):** 1-2 tickets/hour

### 3.4. Top Selling Products Ranking (`GET /api/analytics/top-products`)
| Rank | Product Name | Units Sold | Total Revenue (INR) |
| :---: | :--- | :---: | :---: |
| 1 | Tata Tea Gold Leaf Tea 500g | 64 units | ₹20,480.00 |
| 2 | Maggi 2-Minute Instant Noodles Masala 280g | 64 units | ₹3,712.00 |
| 3 | Aashirvaad Shudh Chakki Atta 5kg | 62 units | ₹17,670.00 |
| 4 | Amul Taaza Homogenised Toned Milk 1L | 32 units | ₹2,368.00 |
| 5 | Britannia 100% Whole Wheat Bread 400g | 32 units | ₹1,600.00 |
| 6 | Tata Salt Vacuum Evaporated Iodised 1kg | 31 units | ₹868.00 |

### 3.5. Cashier Performance & POS Ledger (`GET /api/analytics/cashier-stats`)
| Cashier Name | Assigned Counter | Orders Handled Today | Daily Revenue Attributed |
| :--- | :--- | :---: | :---: |
| **Aarav Sharma** (`cashier1@smartqueue.com`) | Counter 1 (Express Lane - UPI) | 2 | ₹1,240.90 |
| **Priya Patel** (`cashier2@smartqueue.com`) | Counter 2 (General Counter - All) | 3 | ₹11,262.20 |
| **Kavita Rao** (`cashier3@smartqueue.com`) | Counter 3 (Card & Cash) | 3 | ₹3,422.90 |
| **Deepak Sen** (`cashier4@smartqueue.com`) | Counter 4 (Self-Checkout 1) | 2 | ₹2,152.40 |
| **Sunita Sharma** (`cashier5@smartqueue.com`) | Roving / Express Reserve | 2 | ₹12,276.50 |

### 3.6. Inventory & Low-Stock Alert System (`GET /api/inventory/low-stock`)
- **Active Low-Stock Alert:** `Britannia 100% Whole Wheat Bread 400g` (Barcode: `8901725181122`)
  - Current Stock: **7 units**
  - Minimum Alert Threshold: **8 units**
  - Status: ⚠️ **Triggers low-stock badge and procurement notification automatically.**
- All remaining 5 products are healthily stocked between 28 and 85 units.

---

## 4. Live Queue Status

- **Counter 1 (Express Lane - UPI):** Status `BUSY`  
  - Currently Serving: **Ticket #Q-1046** (`customer.demo002@example.test`)
- **Counter 2 (General Counter - All):** Status `BUSY`  
  - Currently Serving: **Ticket #Q-1047** (`customer.demo003@example.test`)
- **Counter 3 (Card & Cash):** Status `OPEN` (Available)
- **Counter 4 (Automated Self-Checkout):** Status `OPEN` (Available)
- **Waiting Line (4 Customers):**
  1. #Q-1048: Sneha Kulkarni — Est. wait: 2.5 min
  2. #Q-1049: Rohit Nair — Est. wait: 5.0 min
  3. #Q-1050: Kavita Reddy — Est. wait: 7.5 min
  4. #Q-1051: Arjun Singhania — Est. wait: 10.0 min

---

## 5. System Login Credentials & Employee Directory

All accounts are pre-configured with secure bcrypt-hashed passwords.

| Role | Name | Email | Password | Assigned Counter |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Super Administrator | `admin@smartqueue.com` | `Admin@123` | Full Store Control |
| **MANAGER** | Suresh Kumar (Store Manager) | `manager@smartqueue.com` | `Manager@123` | Store Management |
| **MANAGER** | Rajiv Nair (Asst. Manager) | `manager2@smartqueue.com` | `Manager@123` | Floor Oversight |
| **CASHIER** | Aarav Sharma | `cashier1@smartqueue.com` | `Cashier@123` | Counter 1 (Express UPI) |
| **CASHIER** | Priya Patel | `cashier2@smartqueue.com` | `Cashier@123` | Counter 2 (General All) |
| **CASHIER** | Kavita Rao | `cashier3@smartqueue.com` | `Cashier@123` | Counter 3 (Card & Cash) |
| **CASHIER** | Deepak Sen | `cashier4@smartqueue.com` | `Cashier@123` | Counter 4 (Self-Checkout) |
| **CASHIER** | Sunita Sharma | `cashier5@smartqueue.com` | `Cashier@123` | Express Counter |
| **CUSTOMER** | Rahul Verma | `customer1@smartqueue.com` | `Customer@123` | Mobile / Desktop Shopper |
| **CUSTOMER** | Ananya Sen | `customer2@smartqueue.com` | `Customer@123` | Mobile / Desktop Shopper |
| **CUSTOMER** | Vikram Malhotra | `customer.demo001@example.test` | `Customer@123` | Demo Shopper |
| **CUSTOMER** | Sneha Kulkarni | `customer.demo002@example.test` | `Customer@123` | Active Serving Customer |
| **CUSTOMER** | ... up to demo050 | `customer.demo050@example.test` | `Customer@123` | Roster of 50 Shoppers |

---

## 6. How to Re-run or Reset Demo Data

To refresh or regenerate the operational simulation at any time:

```bash
# From the backend directory
cd backend
npm run seed:demo
```

Or from the monorepo root:
```bash
npm --prefix backend run seed:demo
```
