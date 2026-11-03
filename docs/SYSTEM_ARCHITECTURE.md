# SmartQueue — System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        Android["Android Mobile App (Kotlin / Compose)<br/>Target: Customer"]
        Desktop["Desktop Web App (React / Vite / TS)<br/>Target: Cashier, Manager, Admin"]
    end

    subgraph Gateway["Transport & Security Layer"]
        REST["REST API (HTTP/JSON + JWT)"]
        WS["WebSocket (Socket.IO Real-Time Events)"]
    end

    subgraph Backend["Shared Backend (Node.js / Express.js)"]
        AuthModule["Auth & RBAC Middleware"]
        QueueEngine["Smart Queue Dispatcher"]
        OrderService["Order & Payment Processing"]
        InventoryService["Catalog & Inventory Management"]
        AIModule["AI Recommendations & Assistant Engine"]
        AnalyticsEngine["Aggregated Metrics Engine"]
    end

    subgraph Data["Persistence Layer"]
        Mongo[("MongoDB Database<br/>Users, Stores, Products, Queues, Orders")]
        LocalCache[("Android Room & DataStore Cache")]
    end

    Android -->|REST Endpoints| REST
    Android <-->|Socket Events| WS
    Desktop -->|REST Endpoints| REST
    Desktop <-->|Socket Events| WS

    REST --> AuthModule
    WS --> QueueEngine

    AuthModule --> QueueEngine
    AuthModule --> OrderService
    AuthModule --> InventoryService
    AuthModule --> AIModule
    AuthModule --> AnalyticsEngine

    QueueEngine --> Mongo
    OrderService --> Mongo
    InventoryService --> Mongo
    AIModule --> Mongo
    AnalyticsEngine --> Mongo

    Android -.-> LocalCache
```

## 1. Architectural Principles
1. **Single Source of Truth**: All queue sequences, tickets, stock validations, and order totals originate from and are verified by the Node.js / MongoDB backend.
2. **Real-time Event Driven**: All queue status changes (JOINED, CALLED, PROCESSING, COMPLETED, SKIPPED, CANCELLED) trigger instant Socket.IO room broadcasts.
3. **Layered Separation**:
   - Android App uses MVVM + Clean Architecture (`domain`, `data`, `presentation`).
   - Desktop App uses modular component architecture, TanStack Query / Axios, and Role Protected Routes.
   - Backend follows modular service-controller-repository pattern.
