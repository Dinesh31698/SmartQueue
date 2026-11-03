# SMARTQUEUE — COMPLETE SYSTEM AUDIT & ARCHITECTURAL REPORT

**Date:** 2026-11-04  
**Audit Scope:** Full-Stack (Backend Node.js/Express/MongoDB, Desktop React/Vite/TypeScript, Mobile Android Kotlin/Jetpack Compose)  
**Lead Architect:** Senior Full-Stack Software Architect & System Engineer  

---

## 1. System Architecture Overview

SmartQueue is an AI-powered smart supermarket shopping and real-time queue management system. The architecture is composed of three interconnected layers:
1. **Centralized Backend (`backend/`):** Node.js, Express.js, MongoDB via Mongoose, and Socket.IO running on port 5000.
2. **Desktop Web Application (`desktop/`):** React 18, TypeScript, Vite, Tailwind CSS with futuristic Cybernetic Neon UI (`#0A0A0A`, `#007AB7`, `#FF2D95`), serving Admin, Manager, and Cashier interfaces. Communicates with `http://localhost:5000/api`.
3. **Native Android Application (`mobile/SmartQueueAndroid/`):** Native Kotlin, Jetpack Compose, Retrofit 2, Kotlinx Serialization, Hilt, Room Database, and Socket.IO client. Communicates with `http://10.0.2.2:5000/api` on the Android emulator (and configurable physical device IP).

All clients communicate with the same centralized backend and persist data in a single MongoDB instance.

---

## 2. In-Depth Component Audit & Root-Cause Discovery

### A. Database Connection & Environment Configuration
- **Connection URI:** `mongodb://127.0.0.1:27017/smartqueue` (`backend/.env`).
- **Live Status:** MongoDB Server v9.0.4 is actively running on local port `27017` with 16 collections initialized (`users`, `products`, `inventories`, `stores`, `storesettings`, `categories`, `counters`, `carts`, `orders`, `queues`, `queuetickets`, etc.).
- **Sandbox Boundary:** TCP loopback connections from sandboxed child processes are blocked with `EACCES 127.0.0.1:27017`. Node processes executing database operations or integration tests require direct TCP socket privileges.

### B. Authentication & Credentials Mismatch Audit
- **Seeded Accounts in MongoDB:**
  - `admin@smartqueue.com` -> `Admin@123` (Role: `ADMIN`)
  - `manager@smartqueue.com` -> `Manager@123` (Role: `MANAGER`)
  - `cashier1@smartqueue.com` -> `Cashier@123` (Role: `CASHIER`)
  - `cashier2@smartqueue.com` -> `Cashier@123` (Role: `CASHIER`)
  - `customer1@smartqueue.com` -> `Customer@123` (Role: `CUSTOMER`)
  - `customer2@smartqueue.com` -> `Customer@123` (Role: `CUSTOMER`)
- **Desktop `LoginPage.tsx` Defect:**
  - The "Demo Quick Access" buttons injected `cashier@smartqueue.com` (non-existent) and password `Pass123!@#` (mismatch).
  - Attempting quick login resulted in `401 Invalid email or password` because the database contains `cashier1@smartqueue.com` with `Cashier@123`.
- **Password Hashing & Hooks:**
  - `User.js` utilizes `bcryptjs` with `pre('save')` checking `if (!this.isModified('password')) return next();`.
  - Passwords in MongoDB are verified via `bcrypt.compare` to match `Admin@123`, `Manager@123`, `Cashier@123`, and `Customer@123`.

### C. The Android "0 Items / No Products Found" Catalog Defect
- **Root Cause 1: Property Name Mismatch (`isActive` vs `isAvailable`):**
  - In `backend/src/controllers/product.controller.js`, `listProducts` initializes `filter = { isActive: true }`.
  - In `backend/src/models/Product.js`, the schema defines `isAvailable: { type: Boolean, default: true }`, but had **NO** `isActive` field.
  - The seeded documents in MongoDB contained `"isAvailable": true`, but `"isActive"` was `undefined`.
  - Consequently, `Product.countDocuments({ isActive: true })` returned `0`, and `Product.find({ isActive: true })` returned `[]`.
- **Root Cause 2: Category Relationship Mismatch:**
  - `Product.js` only defined `category: String`. It lacked `categoryId: { type: ObjectId, ref: 'Category' }`.
  - In `product.controller.js`, queries called `.populate('categoryId', 'name slug icon')` and filtered `if (categoryId) filter.categoryId = categoryId`.
  - Android passed `categoryId` on category filter, matching 0 products.
- **Root Cause 3: Barcode Lookup Broken:**
  - In `product.controller.js`, `getByBarcode` queried `{ barcode: barcode.trim(), isActive: true }`.
  - Because `isActive` was undefined on seeded records, barcode lookups returned 404 for valid barcodes (e.g., `8901262010114`).

### D. Mongoose Model vs. Controller Schema Incompatibilities
1. **`Cart` Model & Controller:**
   - In `Cart.js`, `storeId` was `required: true`.
   - In `cart.controller.js`, `Cart.create({ userId, items: [], subtotal: 0 })` omitted `storeId`, causing `ValidationError: storeId: Path 'storeId' is required`.
   - In `cart.controller.js` `addItem`, it checked `if (!product || !product.isActive)`, which failed because products only had `isAvailable: true`.
2. **`Order` & `OrderItem` Models & Controller:**
   - In `OrderItem.js`, fields `productName` and `unitPrice` were marked `required: true`.
   - In `order.controller.js`, cart items mapped `name` and `price`, omitting `productName` and `unitPrice`, triggering Mongoose validation failures.
   - In `Order.js`, `totalAmount` was marked `required: true`, while controller populated `finalTotal`.
   - In `Order.js`, enum for `paymentStatus` was `['PENDING', 'COMPLETED', 'FAILED']`, while controller set `'PAID'`.
   - In `Order.js`, enum for `orderStatus` was `['PLACED', 'VERIFIED', 'COMPLETED', 'CANCELLED']`, while controller set `'PENDING'`.
3. **`QueueTicket` Model & Controller:**
   - In `QueueTicket.js`, the field is named `estimatedWaitMinutes`. In `queue.controller.js`, it wrote `estimatedWaitTimeMinutes`.
4. **`Counter` Model & Controller:**
   - In `Counter.js`, the field is `currentTicketId`. In `counter.controller.js`, it populated `currentServingTicketId`.

### E. Cross-Platform Real-Time Synchronization Audit
- **Socket.IO Rooms:**
  - `store_${storeId}`: Store-wide broadcasts (`queue_updated`, `counter_status_changed`, `catalog_updated`).
  - `user_${userId}`: Customer-specific alerts (`customer_called`, `order_status_updated`).
  - `counter_${counterId}`: POS lane specific events.
- **Client Implementations:**
  - Desktop: Connected via `desktop/src/contexts/SocketContext.tsx` with room join handlers.
  - Android: Connected via `mobile/.../SocketManager.kt` listening on `http://10.0.2.2:5000` with chime audio trigger on `customer_called`.

---

## 3. Targeted Remediation Plan

1. **Database Models & Schemas:**
   - Update `Product.js`: Add `isActive` (default: true), `categoryId` (ref: 'Category'), `unit`, `aisleLocation`, `taxPercent`, `description`.
   - Update `Cart.js`: Make `storeId` optional with fallback, or resolve from user/store.
   - Update `Order.js`: Support both `totalAmount` and `finalTotal`, `tax` and `taxAmount`, `discount` and `discountAmount`; expand `paymentStatus` enum (`['PENDING', 'PAID', 'COMPLETED', 'FAILED']`) and `orderStatus` enum (`['PENDING', 'PLACED', 'VERIFIED', 'COMPLETED', 'CANCELLED']`).
   - Update `OrderItem.js`: Support `productName` (defaulting to `name`) and `unitPrice` (defaulting to `price`).
   - Update `QueueTicket.js`: Add `estimatedWaitTimeMinutes` alongside `estimatedWaitMinutes`.
   - Update `Counter.js`: Add `currentServingTicketId` alongside `currentTicketId`.
2. **Database Seed & Repair Script:**
   - Run idempotent migration/seed updating all products with `isActive: true`, `isAvailable: true`, category ObjectId links, and verifying all 6 user credentials.
3. **Backend Controllers:**
   - `product.controller.js`: Support filtering by `isAvailable` or `isActive`, resolve `categoryId` by ObjectId or category slug/name, and ensure case-insensitive regex search.
   - `cart.controller.js`: Fix `storeId` initialization, fix availability check.
   - `order.controller.js`: Align order payload mapping with `OrderItem` and `Order` schemas.
4. **Desktop React:**
   - Fix `LoginPage.tsx` quick fill buttons to exact accounts (`cashier1@smartqueue.com`/`Cashier@123`, `manager@smartqueue.com`/`Manager@123`, `admin@smartqueue.com`/`Admin@123`).
5. **Android App:**
   - Verify Retrofit DTO mappings and endpoints.
   - Ensure local Room caching aligns with live backend responses.
6. **Integration Verification:**
   - Execute verification tests A through F.
