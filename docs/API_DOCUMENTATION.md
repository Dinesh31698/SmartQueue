# SmartQueue — API Documentation & Contract Standards

Base URL: `http://localhost:5000/api`

All protected routes require standard Bearer token header:
`Authorization: Bearer <JWT_TOKEN>`

## 1. Response Standard
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error response:
```json
{
  "success": false,
  "error": "Validation failed / Unauthorized / Not found",
  "details": []
}
```

---

## 2. API Groups

### `/api/auth`
- `POST /register`: Register customer account
- `POST /login`: Authenticate and receive JWT + role
- `GET /me`: Fetch authenticated profile
- `PUT /me`: Update profile details

### `/api/stores`
- `GET /`: List active supermarkets
- `GET /:id`: Store metadata
- `POST /resolve-tag`: Verify NFC (`SMARTQUEUE:STORE:STORE-001`) or QR code payload

### `/api/products`
- `GET /`: Filtered catalog (search, category, brand, healthy, trending)
- `GET /barcode/:barcode`: Quick barcode lookup for scanner
- `GET /:id`: Product detail view
- `POST /`: (Manager/Admin) Create product
- `PUT /:id`: (Manager/Admin) Update product & stock
- `DELETE /:id`: (Manager/Admin) Soft/hard delete product

### `/api/cart`
- `GET /`: Get authenticated customer's cart
- `POST /items`: Add item (validates stock)
- `PUT /items/:productId`: Update quantity
- `DELETE /items/:productId`: Remove item
- `DELETE /`: Clear cart

### `/api/queue`
- `POST /join`: Join active queue (returns verified ticket `Q-XXX`)
- `GET /status`: Get customer's active queue position & wait time
- `GET /store/:storeId`: List active queue tickets
- `POST /call`: (Cashier) Call next waiting ticket
- `POST /process`: (Cashier) Start processing ticket
- `POST /complete`: (Cashier) Complete service
- `POST /skip`: (Cashier) Skip ticket
- `POST /leave`: (Customer) Voluntarily leave queue

### `/api/orders`
- `POST /`: Create order from cart & queue ticket
- `GET /customer`: Customer order history
- `GET /:id`: Detailed order breakdown with receipt
- `PUT /:id/status`: Update status (Cashier/Manager)

### `/api/payment`
- `POST /process`: Process payment (UPI, Card, Cash, Self-Checkout) in verified test/simulation mode
- `GET /status/:orderId`: Check payment status

### `/api/recommendations`
- `GET /personalized`: AI recommendations based on user history
- `GET /trending`: Most purchased products
- `GET /healthy`: Nutritious & healthy picks
- `GET /frequently-bought/:productId`: Complementary item suggestions

### `/api/analytics`
- `GET /manager-summary`: Revenue, order volume, cashier performance, queue wait metrics
- `GET /inventory-alerts`: Low stock items requiring restock

### `/api/cashier` & `/api/manager`
- Cashier counter assign/release and live lane management endpoints.

### `/api/health`
- `GET /`: Health check endpoint reporting server, database, and WebSocket status.
