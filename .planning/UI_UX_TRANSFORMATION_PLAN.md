# SMARTQUEUE — PREMIUM FUTURISTIC UI/UX TRANSFORMATION PLAN (GSD)

## Objective
Elevate the SmartQueue full-stack system into a world-class, commercial-grade technology product with a cinematic, futuristic visual identity:
- **Primary Color Palette**:
  - Jet Black: `#0A0A0A` (Dominant foundation)
  - Cerulean Blue: `#007AB7` (Primary interactive accent & glow)
  - Neon Rose: `#FF2D95` (Secondary highlights & accent)
  - Deep Black: `#050505` (Base backdrop)
  - Elevated Surface: `#111318`
  - Secondary Surface: `#171A21`
  - Muted Surface: `#20242D`
- **Typography**: Space Grotesk (Headings), Sora (Display), Inter (UI), JetBrains Mono (Tickets, Prices, IDs).
- **Core Principle**: Zero destruction of existing verified functionality (APIs, Mongoose models, Socket.IO, POS billing, CameraX/ML Kit, Room caching, NFC).

---

## Task Breakdown & Verification Waves

### Wave 1: Design Tokens & Visual Architecture (Desktop Web)
- [x] Configure Google Fonts in `desktop/index.html` (Space Grotesk, Inter, JetBrains Mono, Sora).
- [x] Configure Tailwind theme tokens in `desktop/tailwind.config.js` (`jet-black`, `cerulean`, `neon-rose`, `surface-*`, `glow-*`, `font-*`).
- [x] Implement cybernetic CSS utilities in `desktop/src/index.css` (`glass-panel`, `glass-card`, `text-gradient-neon`, `border-luminous`, cyber-grid, custom scrollbar).

### Wave 2: Commercial Public Landing Page
- [x] Create `desktop/src/pages/public/LandingPage.tsx`:
  - Glass navbar with logo, links, and CTAs.
  - Cinematic hero section: "SHOP SMARTER. QUEUE LESS.", cybernetic supermarket lattice with blue & pink rim lighting.
  - Animated live metrics section.
  - Bento Grid features showcase.
  - Interactive "How It Works" 6-step timeline.
  - AI Shopping Assistant showcase with simulated sample prompts.
  - Multi-stakeholder value cards (Shoppers, Cashiers, Managers, Supermarkets).
  - Final CTA & Footer.
- [x] Mount `/` to Landing Page in `AppRoutes.tsx` and preserve `/login` and role-protected routes.

### Wave 3: Desktop Application Shell & Screens Redesign
- [x] Redesign `desktop/src/pages/auth/LoginPage.tsx`:
  - Futuristic split/centered cinematic layout with blue/pink ambient glow, password visibility toggle, accessible aria-label, quick role indicators, and real JWT auth.
- [x] Redesign Application Shell:
  - `Sidebar.tsx`: Jet black glass panel, neon indicator badges, role-based navigation, live socket sync status, user profile capsule, logout.
  - `Header.tsx`: Glass topbar with live WebSocket status indicator, store badge, notifications bell.
  - `StatusBadge.tsx`: Glowing neon pill tags for queue and order statuses.
- [x] Redesign `desktop/src/pages/manager/ManagerDashboardPage.tsx` & `DashboardOverviewPage.tsx`:
  - Bento Grid layout with KPI cards, Recharts AreaChart with neon cyan/rose gradients and dark glass tooltips, live counter status.
- [x] Redesign `desktop/src/pages/cashier/CashierDashboardPage.tsx`:
  - High-efficiency dark POS checkout terminal, barcode scanner input, live billing items table, payment methods, printable receipt modal.
- [x] Redesign `desktop/src/pages/inventory/InventoryPage.tsx`:
  - Dark glass table, search, category chips, Add Product & Restock modals with neon accents.
- [x] Redesign `desktop/src/pages/orders/OrdersPage.tsx`:
  - Dark transaction audit table, status filters, itemized order details modal with receipt print.
- [x] Redesign `desktop/src/pages/queue/QueueMonitoringPage.tsx`:
  - Digital queue command center, glowing ticket numbers, Now Serving cards, Next In Line feed, counter switches.
- [x] Redesign `desktop/src/pages/analytics/AnalyticsPage.tsx`:
  - Recharts Area and Bar charts with cyan/rose glow, top selling products, cashier throughput, CSV report export.
- [x] Redesign `desktop/src/pages/settings/SettingsPage.tsx`:
  - Store parameters configuration, NFC/QR switches, staff directory and Add Employee modal.

### Wave 4: Native Android Application Redesign (Kotlin + Jetpack Compose)
- [x] Update `Color.kt` with Jet Black (`0xFF0A0A0A`), Cerulean Blue (`0xFF007AB7`), Neon Rose (`0xFFFF2D95`), Elevated Surface (`0xFF111318`), Secondary Surface (`0xFF171A21`).
- [x] Update `Theme.kt` with DarkColorScheme matching the palette, neon gradients, and typography.
- [x] Update `Type.kt` with JetBrains Mono and clean modern typography.
- [x] Redesign `HomeScreen.kt`:
  - Futuristic dark header, NFC & store chip, glowing AI Assistant card, category chips, product cards with neon badges, live cart badge, rupee-denominated prompt placeholder.
- [x] Redesign `BarcodeScannerScreen.kt`:
  - Glowing cybernetic viewfinder frame with cyan/rose corner markers, quick simulator buttons, manual code dialog, lookup error recovery card, scanned product popup card.
- [x] Redesign `CartScreen.kt`:
  - Dark elevated cards, item quantity controls, payment method chips, subtotal/tax/total breakdown, glowing checkout button.
- [x] Redesign `QueueScreen.kt`:
  - Massive glowing ticket number (`Q-104`), status badge, shoppers ahead, estimated wait time, live counter assignment, turn alert dialog with chime & vibration.

### Wave 5: Verification, CodeRabbit Review & Ralph Loop
- [x] Run desktop production build: `npm run build --prefix desktop` (Passed: 0 errors).
- [x] Run Android unit tests: `gradlew.bat testDebugUnitTest` (Passed: 100%).
- [x] Run Android APK assembly: `gradlew.bat assembleDebug` (Passed: output at `mobile\SmartQueueAndroid\app\build\outputs\apk\debug\app-debug.apk`).
- [x] Deploy APK to `Pixel_6` emulator (`emulator-5554`) and test navigation.
- [x] Capture live emulator screenshots (`docs/smartqueue_home_redesign.png`, `docs/smartqueue_scanner_redesign.png`, `docs/smartqueue_cart_redesign.png`, `docs/smartqueue_ticket_redesign.png`).
- [x] Run CodeRabbit review CLI (`coderabbit review --agent`) on changes.
- [x] Fix all 7 CodeRabbit findings in code.
- [x] Update documentation (`TESTING_REPORT.md`, `README.md`).
