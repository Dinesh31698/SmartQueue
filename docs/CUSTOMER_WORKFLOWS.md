# SmartQueue — Customer End-to-End Workflows

## Workflow 1: Store Entry & Verification
1. Customer walks into the supermarket.
2. Tap phone to NFC tag or scan QR code at the entrance turnstile.
3. Android app parses payload (`SMARTQUEUE:STORE:STORE-001`).
4. Backend confirms store is active and loads current store catalog.

## Workflow 2: Self-Scan & Cart Management
1. Customer picks an item off the shelf.
2. Customer taps "Scan Product" on Android app.
3. CameraX opens with ML Kit barcode reader.
4. Barcode is sent to `GET /api/products/barcode/:barcode`.
5. Product preview modal displays name, price, nutritional highlights, and stock.
6. Customer adds item to cart (`POST /api/cart/items`).
7. App synchronizes local Room cache and DataStore.

## Workflow 3: Queue Joining & Progress
1. Customer finishes shopping and opens Cart.
2. Clicks "Proceed to Smart Checkout".
3. Selects payment method (UPI, Card, Cash, Self-Checkout).
4. System calculates best counter and generates official queue ticket (`POST /api/queue/join`).
5. Customer sees live ticket progression on Android (`Waiting: 2 customers ahead, Est. 4 mins`).
6. Cashier calls customer ticket from React desktop (`status -> CALLED`).
7. Android receives instant Socket.IO push notification and rings alert: "Counter 2 is calling Ticket Q-102!".

## Workflow 4: Billing & Digital Receipt
1. Customer approaches Counter 2.
2. Cashier verifies items and confirms payment.
3. Backend marks Queue Entry as `COMPLETED` and creates Order record.
4. Customer screen updates immediately with digital receipt.
