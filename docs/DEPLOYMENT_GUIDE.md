# SmartQueue — Deployment Guide

## 1. Backend Production Deployment
1. Provision a Linux/Cloud VM or container runtime (Docker, AWS ECS, GCP Cloud Run).
2. Install Node.js v20 LTS.
3. Configure environment variables in `.env`:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartqueue`
   - `JWT_SECRET=<secure_256bit_random_key>`
   - `CORS_ORIGIN=https://smartqueue.yourdomain.com`
4. Start with PM2 or Docker:
   ```bash
   pm2 start server.js --name smartqueue-backend -i max
   ```

## 2. Desktop Web Application Deployment
1. Build optimized static assets:
   ```bash
   cd desktop
   npm run build
   ```
2. Serve `desktop/dist` using Nginx, Cloudflare Pages, AWS S3 + CloudFront, or Vercel.
3. Ensure Nginx reverse-proxies `/api` and `/socket.io` to the Node.js backend cluster.

## 3. Android Application Distribution
1. Build release signed APK or Android App Bundle (AAB):
   ```bash
   cd mobile/SmartQueueAndroid
   ./gradlew assembleRelease
   ```
2. Distribute via internal test track or Google Play Store.
