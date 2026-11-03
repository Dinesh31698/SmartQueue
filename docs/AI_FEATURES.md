# SmartQueue — AI Features & Recommendation Engine

SmartQueue integrates AI at both the backend service layer and on-device Android layer:

## 1. Backend Recommendation Engine
1. **Frequently Bought Together (Market Basket Analysis)**:
   - Evaluates past order patterns where products co-occur.
   - Suggests complementary items (e.g. Bread -> Butter, Pasta -> Pasta Sauce).
2. **Healthy Picks & Dietary Alternatives**:
   - Analyzes product nutritional profiles (calories, sugar, sodium, fiber).
   - Surfaces lower-sugar, high-protein, or organic alternatives to selected items in cart.
3. **Trending & Popular Products**:
   - Aggregates top-selling products in the last 7 days per category.
4. **Personalized Recommendations**:
   - Leverages customer past purchase history to surface repeated favorites and preferred brands.

## 2. On-Device AI & Hardware Integration
1. **Google ML Kit Barcode Vision**:
   - On-device edge computer vision pipeline running on CameraX analyzer frames.
   - Supports EAN-13, EAN-8, UPC-A, UPC-E, Code-128, and QR codes with zero cloud latency.
2. **Voice Shopping Assistant**:
   - Android `SpeechRecognizer` translates spoken customer intent into structured commands ("Find whole wheat bread", "What's my queue status?").
   - Text-to-Speech (TTS) synthesizes audible feedback for hands-free shopping.
3. **On-Device LLM / MediaPipe Fallback Architecture**:
   - Configurable lightweight local assistant fallback for offline item search and dietary Q&A.
