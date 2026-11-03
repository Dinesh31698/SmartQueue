# SmartQueue — AI-Powered Smart Supermarket Shopping & Queue Management System

SmartQueue is an intelligent full-stack supermarket shopping and queue management platform designed to eliminate checkout waiting lines, streamline cashier billing operations, and provide seamless customer shopping experiences.

---

## 1. Visual Identity & Design System

The system features a **commercial-grade, futuristic cybernetic design identity** inspired by human-tech retail systems with dual-rim ambient lighting, dark glassmorphism, and high-contrast typography.

### Strict Color Palette
- **Jet Black (`#0A0A0A`)**: Dominant canvas foundation across desktop web and Android applications.
- **Cerulean Blue (`#007AB7`)**: Primary interactive accents, glowing buttons, active tabs, and primary status indicators.
- **Neon Rose (`#FF2D95`)**: Secondary highlights, live badge pills, queue ticket numbers, and dual-gradient text accents.
- **Deep Black (`#050505`)**: Base backdrop for deep contrast.
- **Elevated Surfaces (`#111318` / `#171A21` / `#20242D`)**: Tiered dark glass panels with luminous borders.
- **Typography**: Space Grotesk / Sora (Headings & Display), Inter (UI & Body), JetBrains Mono (Tickets, Prices, SKU Barcodes, Ledger Amounts).

---

## 2. System Architecture

The platform connects three specialized components into an integrated architecture:

1. **Desktop Web Application**: React 18+ / TypeScript / Vite / Tailwind / Lucide Icons / Recharts / Socket.IO Client.
   - **Commercial Public Landing Page** (`/`): Cinematic hero ("SHOP SMARTER. QUEUE LESS."), live metrics counter strip, Bento Grid features showcase, 6-step shopper lifecycle timeline, interactive AI shopping assistant simulator, multi-stakeholder value matrix, and direct staff gateway.
   - **Cashier POS Station** (`/cashier`): Claim counter lane, call next waiting shopper, live item scanning, line item quantity manipulation, multi-method payment processing (Cash, Card, UPI, Simulated Test), and printable digital thermal invoices.
   - **Store Executive Matrix** (`/manager`): Bento Grid KPI cards, real-time Recharts area charts for sales velocity, live checkout lane monitoring, and low-stock telemetry.
   - **Catalog & Stock Surveillance** (`/inventory`): Full inventory table, stock level status badges, live search, category filter, "Register SKU" modal, and restock modal.
   - **Transaction Audit Ledger** (`/orders`): Searchable order audit ledger, order status filters, and itemized invoice details modal with print capability.
   - **Dynamic Queue Orchestration** (`/queue`): Hardware lane switches (Open/Close), average wait prediction metrics, and live store public display HUD preview.
   - **Business Reports & Analytics** (`/analytics`): 7-day revenue trajectory area chart, hourly queue traffic bar chart, top-selling products, cashier velocity table, and 1-click CSV report export.
   - **System Parameters & Staff Directory** (`/settings`): Supermarket operational rules, max queue per lane, NFC/QR gate switches, and staff provisioning modal.
2. **Android Mobile Application**: Native Android in Kotlin using Jetpack Compose, Material 3, Clean Architecture + MVVM, Hilt, Retrofit, Room, CameraX, Google ML Kit, native NFC, and Socket.IO client.
   - **Home Screen**: Dark header with NFC & store pairing chip, futuristic search bar, category chips, AI Shopping Copilot card, product feed with dietitian-approved "Healthy Pick" badges, and live cart counter badge.
   - **Vision Barcode Scanner Screen**: Sub-second CameraX + Google ML Kit scanner with cybernetic viewfinder reticle, dual Cerulean/Rose corner targeting brackets, emulator barcode simulator buttons, manual SKU lookup dialog, and error recovery banner.
   - **Digital Cart & Payment Screen**: Itemized cards with quantity controllers, payment preference chips (UPI, Card, Cash), dynamic subtotal/tax/total breakdown in JetBrains Monospace, and glowing queue checkout button.
   - **Live Queue Token Screen**: Massive glowing ticket number (`Q-104`), real-time status pill ("NOW SERVING • HEAD TO COUNTER"), shoppers ahead counter, estimated wait prediction, assigned cashier lane, and audio chime & vibration alert dialog.
3. **Shared Central Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT authentication, role-based access control, dynamic queue prediction, AI shopping assistant, and centralized error handling.

---

## 3. User Roles & Verified Capabilities

| Role | Client Application | Key Capabilities |
|---|---|---|
| **CUSTOMER** | Android App | In-store navigation, product search, barcode scanning (CameraX + ML Kit), NFC / QR store detection, smart shopping cart, digital checkout, dynamic queue booking, live queue position tracking, AI shopping assistant with TTS, local offline caching with Room. |
| **CASHIER** | Desktop React Web | Counter station claiming, calling next waiting customer, live queue status, item scanning, live POS bill calculation, multi-mode billing (UPI, Card, Cash, Simulated Test), instant digital receipt generation, ticket completion. |
| **MANAGER** | Desktop React Web | Real-time queue monitoring, counter throughput metrics, store inventory tracking, low-stock alerts, customer order history, cashier performance analytics, daily sales velocity Recharts charts, CSV export. |
| **ADMIN** | Desktop React Web | Supermarket configuration, multi-lane management, staff user provisioning, autonomous counter balancing rules, system health monitoring, analytics reporting. |

---

## 4. Verification Commands & Execution Status

### Backend Verification
```bash
npm test --prefix backend
npm run seed --prefix backend
```
- Status: **10/10 Jest tests passed**, Express server boots on port 5000, 16 Mongoose models verified, Socket.IO client connects & joins store room, queue prediction algorithm tested, AI assistant query engine verified.

### Desktop Web Verification
```bash
npm run build --prefix desktop
```
- Status: **TypeScript check passed (0 errors)**, Vite production bundle built cleanly in ~19s (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`).

### Android Verification
```bash
cd mobile/SmartQueueAndroid
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```
- Status: **BUILD SUCCESSFUL**, all unit tests passed, **APK generated** at `mobile/SmartQueueAndroid/app/build/outputs/apk/debug/app-debug.apk` (39.8 MB), installed and verified on `Pixel_6` Android emulator (`emulator-5554`) via ADB.
- Screenshots Captured:
  - Home: `docs/smartqueue_home_redesign.png`
  - Scanner: `docs/smartqueue_scanner_redesign.png`
  - Cart: `docs/smartqueue_cart_redesign.png`
  - Queue Ticket: `docs/smartqueue_ticket_redesign.png`

### CodeRabbit CLI Verification
```bash
coderabbit review --agent --plain
```
- Status: **Review Completed**, audited 22 source files across Desktop and Mobile. 7 findings detected, 100% resolved in source code and re-verified with production builds.

---

## 5. Demo Accounts & Credentials

The seed script (`npm run seed --prefix backend`) creates the following accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@smartqueue.com` | `Pass123!@#` |
| **Manager** | `manager@smartqueue.com` | `Pass123!@#` |
| **Cashier 1** | `cashier@smartqueue.com` | `Pass123!@#` |
| **Cashier 2** | `cashier2@smartqueue.com` | `Pass123!@#` |
| **Customer 1** | `customer@smartqueue.com` | `Pass123!@#` |
| **Customer 2** | `customer2@smartqueue.com` | `Pass123!@#` |
