# SmartQueue — Android Customer Application (Kotlin + Jetpack Compose)

The mobile client is a native Android application built with Kotlin, Jetpack Compose, Material 3, and Clean Architecture + MVVM. It is designed for supermarket shoppers.

---

## 1. Technical Stack & Architecture
- **Language**: Kotlin 1.9+
- **UI Toolkit**: Jetpack Compose & Material 3
- **Architecture**: Clean Architecture (Domain, Data, Presentation layers) + MVVM
- **Dependency Injection**: Dagger Hilt
- **Network**: Retrofit 2 + OkHttp 3 + Kotlin Serialization
- **Local Cache**: Room Database (Catalog cache & offline orders) + DataStore Preferences (Tokens, user profile, store selection)
- **Real-Time Client**: Socket.IO Java/Android Client
- **Camera & Barcode**: CameraX + Google ML Kit Barcode Scanning API
- **NFC Hardware**: Android Native NFC Adapter & NDEF Message Parser
- **Voice & TTS**: Android `SpeechRecognizer` + `TextToSpeech` API

---

## 2. Customer Application Screens & Flows
1. **Splash & Authentication**: Session validation via DataStore token, Customer Registration & Login.
2. **Store Identification**: Scan NFC shelf tag or QR code at entrance (`SMARTQUEUE:STORE:STORE-001`) to lock store context.
3. **Catalog & Search**: Interactive category browsing, keyword search, brand filtering, nutrition data.
4. **Barcode Scanner**: CameraX viewfinder with real-time ML Kit bounding box and instant product carting.
5. **Smart Cart**: Quantity adjustments, subtotal calculation, instant stock re-check.
6. **Smart Queue Experience**:
   - Lane selection or auto-assigned optimal counter based on payment method (UPI / Card / Cash / Self-Checkout).
   - Dynamic ticket receipt (`Q-104`).
   - Live queue status screen showing: Current ticket being served, tickets ahead, estimated wait time, audio/vibration alert when called.
7. **Order Confirmation & Digital Receipt**: Itemized summary with QR order receipt.
8. **AI Assistant & Voice**: Natural language query input for item lookup and store guidance.
