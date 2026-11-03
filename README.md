# SmartQueue — AI-Powered Smart Supermarket Shopping & Queue Management System

SmartQueue is an intelligent full-stack supermarket shopping and queue management platform designed to eliminate waiting lines, streamline cashier billing operations, and provide seamless customer shopping experiences.

---

## 1. System Overview

The system connects three specialized components into an integrated architecture:

1. **Desktop Web Application**: React 18+ / TypeScript / Vite / Tailwind / Lucide Icons / Recharts / Socket.IO Client. Tailored for Cashiers, Store Managers, and System Administrators.
2. **Android Mobile Application**: Native Android in Kotlin using Jetpack Compose, Material 3, Clean Architecture + MVVM, Hilt, Retrofit, Room, CameraX, Google ML Kit, native NFC, and Socket.IO client. Tailored for Supermarket Customers.
3. **Shared Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT authentication, role-based access control, dynamic queue prediction, AI shopping assistant, and centralized error handling.

---

## 2. User Roles & Verified Capabilities

| Role | Client Application | Key Capabilities |
|---|---|---|
| **CUSTOMER** | Android App | In-store navigation, product search, barcode scanning (CameraX + ML Kit), NFC / QR store detection, smart shopping cart, digital checkout, dynamic queue booking, live queue position tracking, AI shopping assistant with Text-To-Speech (TTS), local offline caching with Room. |
| **CASHIER** | Desktop React Web | Counter station claiming, calling next waiting customer, live queue status, item scanning, live POS bill calculation, multi-mode billing (UPI, Card, Cash, Simulated Test), instant digital receipt generation, ticket completion. |
| **MANAGER** | Desktop React Web | Real-time queue monitoring, counter throughput metrics, store inventory tracking, low-stock alerts, customer order history, cashier performance analytics, daily sales velocity Recharts charts, CSV export. |
| **ADMIN** | Desktop React Web | Supermarket configuration, multi-lane management, staff user provisioning, autonomous counter balancing rules, system health monitoring, analytics reporting. |

---

## 3. Technology Stack

### Backend
- **Runtime**: Node.js v20.20.2
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB with Mongoose ODM (v8.3.1)
- **Real-Time Communication**: Socket.IO (v4.7.5)
- **Security & Auth**: JWT, bcryptjs, Helmet, CORS, Express-Validator, Rate Limiting
- **Services**: Dynamic Queue Wait Time Prediction, AI Shopping Assistant Engine
- **Testing**: Jest, Supertest (10/10 tests passed)

### Desktop Web Application
- **Framework**: React 18.2 with TypeScript 5.4
- **Tooling**: Vite 5.2 (Production build passed, 0 errors)
- **Routing**: React Router DOM v6.23
- **State & Data Fetching**: Context API, Axios 1.6
- **Real-Time Updates**: Socket.IO Client 4.7
- **Form Management**: React Hook Form with Zod validation
- **Analytics Visualization**: Recharts 2.12
- **Icons & UI**: Lucide React, Tailwind CSS 3.4

### Android Mobile Application
- **Language**: Kotlin 1.9.23
- **UI Framework**: Jetpack Compose & Material 3 (BOM 2024.04.01)
- **Architecture**: MVVM + Clean Architecture (Domain, Data, Presentation layers)
- **Dependency Injection**: Dagger Hilt 2.51.1
- **Network & API**: Retrofit 2.11.0, OkHttp 4.12.0, Kotlinx Serialization
- **Local Persistence**: Room Database 2.6.1, Jetpack DataStore Preferences 1.1.0
- **Real-Time**: Socket.IO Client for Java/Android 2.1.0
- **Hardware Integration**:
  - CameraX (v1.3.3) + Google ML Kit Barcode Scanning (v17.2.0)
  - Native Android NFC (NDEF Tag reading & dispatch with `SMARTQUEUE:STORE:` parsing)
  - Android Text-To-Speech (TTS) for AI Assistant Voice responses
- **Testing**: JUnit 4 unit tests (3/3 passed via `gradlew.bat testDebugUnitTest`) + Emulator deployment (`Pixel_6`)

---

## 4. Repository & Folder Structure

```
SmartQueue/
├── backend/                  # Shared Node.js Express & MongoDB REST API + Socket.IO server
│   ├── src/
│   │   ├── config/           # Database, environment and app config
│   │   ├── controllers/      # Route controllers for all business logic
│   │   ├── middleware/       # JWT auth, RBAC, error handlers, rate limiting
│   │   ├── models/           # 16 Mongoose database models
│   │   ├── routes/           # REST API route definitions
│   │   ├── services/         # Queue prediction engine, AI Assistant service
│   │   ├── sockets/          # Socket.IO event handlers and rooms
│   │   ├── utils/            # Seed data script and formatters
│   │   └── app.js            # Express app configuration
│   ├── tests/                # Automated backend unit and integration tests
│   ├── server.js             # Server startup and HTTP/WebSocket bootstrap
│   └── package.json
│
├── desktop/                  # React + TypeScript + Vite Desktop Web Application
│   ├── src/
│   │   ├── api/              # Axios HTTP client and backend API integrations
│   │   ├── components/       # Shared reusable UI components
│   │   ├── contexts/         # Authentication and Socket.IO state contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Main dashboard, Cashier, and Manager layouts
│   │   ├── pages/            # Role-specific operational pages
│   │   ├── routes/           # Route configuration and protected route guards
│   │   ├── types/            # TypeScript interfaces and data models
│   │   └── utils/            # Shared formatting and calculation utilities
│   ├── public/               # Static assets
│   ├── vite.config.ts        # Vite configuration
│   └── package.json
│
├── mobile/                   # Native Android Customer Application
│   └── SmartQueueAndroid/
│       ├── app/
│       │   ├── src/main/java/com/smartqueue/app/
│       │   │   ├── data/     # Remote API, Room DB, Repositories, DataStore, Socket
│       │   │   ├── di/       # Dagger Hilt injection modules
│       │   │   ├── domain/   # Models, Repository interfaces
│       │   │   ├── ui/       # Jetpack Compose screens, ViewModels, Themes
│       │   │   └── SmartQueueApp.kt / MainActivity.kt
│       │   ├── build.gradle.kts
│       │   └── src/main/AndroidManifest.xml
│       ├── gradle/
│       ├── build.gradle.kts
│       └── settings.gradle.kts
│
├── docs/                     # Comprehensive architecture and operational documentation
│   ├── TESTING_REPORT.md     # Full QA and verification matrix
│   └── KNOWN_LIMITATIONS.md  # Hardware and simulation environment parameters
│
├── package.json              # Monorepo management scripts
├── .gitignore
├── .env.example
└── README.md
```

---

## 5. Verification Commands & Execution Status

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
- Status: **TypeScript check passed (0 errors)**, Vite production bundle built cleanly in ~24s (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`).

### Android Verification
```bash
cd mobile/SmartQueueAndroid
.\gradlew.bat testDebugUnitTest
.\gradlew.bat assembleDebug
```
- Status: **3/3 JUnit unit tests passed**, **APK generated** at `mobile/SmartQueueAndroid/app/build/outputs/apk/debug/app-debug.apk` (~39.7 MB), installed and verified on `Pixel_6` Android emulator via ADB.

---

## 6. Demo Accounts & Credentials

The seed script (`npm run seed --prefix backend`) creates the following accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@smartqueue.com` | `Admin@123` |
| **Manager** | `manager@smartqueue.com` | `Manager@123` |
| **Cashier 1** | `cashier1@smartqueue.com` | `Cashier@123` |
| **Cashier 2** | `cashier2@smartqueue.com` | `Cashier@123` |
| **Customer 1** | `customer1@smartqueue.com` | `Customer@123` |
| **Customer 2** | `customer2@smartqueue.com` | `Customer@123` |
