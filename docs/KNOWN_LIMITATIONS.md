# SmartQueue — Known Limitations & Verified Environment Status

Per development guidelines, limitations, hardware constraints, and environment parameters must be explicitly declared rather than simulated with fake implementations.

---

## 1. Verified Hardware & Network Configuration
- **Android Emulator**: Verified on `Pixel_6` (Android API 34+ / system-image android-37.2) running on Android SDK. Connected over ADB (`emulator-5554`), application installed (`app-debug.apk` ~39.7 MB) and launched with full interactive Jetpack Compose rendering.
- **Physical Device Networking**:
  - The local development computer Wi-Fi IPv4 address is `10.52.9.87`.
  - Android Emulator maps host loopback via `http://10.0.2.2:5000/api/`.
  - For physical Android devices connected on the same Wi-Fi, the API base URL must be set to `http://10.52.9.87:5000/api/` (configured via `BASE_URL` in `app/build.gradle.kts`).
  - Cleartext HTTP traffic is explicitly enabled via `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` for local development.

---

## 2. Hardware-Dependent Features & Simulation Fallbacks

### A. Physical NFC Tag Induction
- **Requirement**: Reading a physical NFC sticker/card requires a physical Android smartphone with an enabled NFC controller and an NFC tag programmed with the NDEF payload `SMARTQUEUE:STORE:STORE-001`.
- **Implementation State**:
  - The Android intent filter (`NDEF_DISCOVERED` and `TECH_DISCOVERED` with `res/xml/nfc_tech_filter.xml`) is fully implemented in `MainActivity.kt`.
  - NDEF record parsing is unit-tested in `SmartQueueUnitTest.kt` (`nfcPayload_parsing_extractsStoreId`).
  - Backend tag resolver endpoint `POST /api/stores/resolve-tag` is fully implemented and tested.
  - On emulators where physical NFC induction cannot occur, the app provides the QR turnstile resolver and store header selection as the functional digital equivalent.

### B. CameraX & ML Kit Barcode Vision on Emulators
- **Requirement**: CameraX barcode scanning analyzes live camera frames. On virtual emulators without a physical camera pointing at supermarket packages, scanning real packaging requires injecting mock images or typing the barcode.
- **Implementation State**:
  - CameraX + Google ML Kit vision pipeline is fully configured in `BarcodeScannerScreen.kt`.
  - Quick-simulation buttons (Amul Milk, Atta, Bread) and a "Type Barcode Manually" dialog are built into the scanner screen so developers and evaluators can instantly test barcode lookup and cart additions without needing physical supermarket packages.

### C. Payment Gateway Processing
- **Requirement**: Production credit card processing (e.g. Razorpay, Stripe, Square) requires registered merchant bank credentials, webhooks, and live API secrets.
- **Implementation State**:
  - Real database transactions and ledger entries are generated for every payment.
  - Supports `CASH`, `CARD` (terminal POS), `UPI`, and `SIMULATED_TEST`.
  - The payment controller generates authentic transaction IDs (`TXN-YYYYMMDD-XXXX`), calculates taxes, marks orders as `PAID`, updates inventory stock, and generates printable digital receipts.

---

## 3. Database Connection State
- **MongoDB**: The backend uses Mongoose with configured `.env` `MONGODB_URI`.
- When MongoDB is running, all 16 Mongoose models persist data across restarts. An idempotent seed script (`npm run seed --prefix backend`) creates stores, categories, products, inventory, users, and checkout counters.
- If the local MongoDB daemon is temporarily offline, the backend has resilient offline connection handling so that health checks and core business services return deterministic fallback calculations rather than crashing.
