# SmartQueue — Database Design & Schema Specifications

The system utilizes MongoDB with Mongoose ODM for structured, indexed, and validated document persistence.

```mermaid
erDiagram
    STORE ||--o{ COUNTER : has
    STORE ||--o{ PRODUCT : stocks
    STORE ||--o{ QUEUE_ENTRY : serves
    USER ||--o{ ORDER : places
    USER ||--o{ QUEUE_ENTRY : holds
    USER ||--o{ CART_ITEM : contains
    ORDER ||--o{ ORDER_ITEM : details
    ORDER ||--|| PAYMENT : verified_by
    COUNTER ||--o{ QUEUE_ENTRY : calls

    USER {
        ObjectId _id PK
        string name
        string email
        string phone
        string passwordHash
        string role "CUSTOMER | CASHIER | MANAGER | ADMIN"
        ObjectId storeId FK
        boolean isActive
        date createdAt
    }

    STORE {
        ObjectId _id PK
        string storeCode UK "e.g. STORE-001"
        string name
        string address
        string nfcTagPayload
        string qrCodePayload
        boolean isActive
    }

    COUNTER {
        ObjectId _id PK
        ObjectId storeId FK
        string counterNumber
        ObjectId assignedCashierId FK
        string status "OPEN | CLOSED | BUSY"
        string acceptedPaymentType "ALL | UPI | CARD | CASH | SELF_CHECKOUT"
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId storeId FK
        string barcode UK
        string name
        string brand
        string category
        number price
        number stockQuantity
        string imageUrl
        object nutritionalInfo
        boolean isHealthyPick
        boolean isTrending
    }

    QUEUE_ENTRY {
        ObjectId _id PK
        ObjectId storeId FK
        ObjectId customerId FK
        ObjectId counterId FK
        string ticketNumber "e.g. Q-101"
        string paymentMethod "UPI | CARD | CASH | SELF_CHECKOUT"
        string status "WAITING | CALLED | PROCESSING | COMPLETED | SKIPPED | CANCELLED"
        number estimatedWaitMinutes
        date joinedAt
        date calledAt
        date completedAt
    }

    ORDER {
        ObjectId _id PK
        string orderNumber UK "e.g. ORD-2026-0001"
        ObjectId customerId FK
        ObjectId storeId FK
        ObjectId counterId FK
        number subtotal
        number tax
        number totalAmount
        string paymentStatus "PENDING | COMPLETED | FAILED"
        string orderStatus "PLACED | VERIFIED | COMPLETED | CANCELLED"
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId orderId FK
        string transactionId
        string paymentMethod "UPI | CARD | CASH | SELF_CHECKOUT"
        number amount
        string status "SUCCESS | FAILED | SIMULATED_TEST"
    }
```

## Schema Validation & Indexes
- **Product**: Unique compound index on `storeId + barcode`.
- **Queue Entry**: Unique active index on `storeId + ticketNumber` for active states.
- **Order**: Unique index on `orderNumber`.
- **User**: Unique sparse indexes on `email` and `phone`.
