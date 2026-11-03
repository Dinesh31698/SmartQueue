# SmartQueue — Project Overview

## 1. Executive Summary
SmartQueue is an enterprise-grade AI-powered smart supermarket shopping and real-time queue management system. Traditional supermarkets suffer from cashier bottlenecks, lengthy physical queues, misplaced stock, and fragmented customer experiences. SmartQueue bridges in-store physical shopping with modern digital workflows through:
- Real-time queue reservations and position tracking on Android.
- Mobile self-scanning with Google ML Kit & CameraX.
- NFC and QR code supermarket identification.
- Real-time cashier counter dispatch and queue processing on a React Desktop dashboard.
- Store manager inventory tracking, revenue analytics, and queue throughput metrics.
- Multi-tier AI recommendation engine (healthy picks, trending items, frequently bought together).

---

## 2. Key Objectives
1. **Queue Optimization**: Eliminate standing in physical checkout lines. Customers can shop freely while their queue position progresses dynamically.
2. **Operational Efficiency**: Cashiers receive orderly customer queues based on basket size, payment method (UPI, Card, Cash, Self-Checkout), and arrival time.
3. **Data Integrity & Server Source of Truth**: Strictly prevent duplicate queue numbers, fraudulent payments, or phantom inventory deductions through server-enforced atomic transactions.
4. **Resilient Communication**: Real-time Socket.IO synchronization between Android mobile devices, Cashier web terminals, and Manager dashboards.

---

## 3. Core Roles & Access Boundaries
- **Customer**: Mobile-only user. Registers, searches catalogue, scans barcodes, builds cart, selects checkout counter/payment type, monitors queue ticket, receives alerts.
- **Cashier**: Desktop-only user. Manages checkout lane (open/closed/busy), calls next ticket, verifies cart/items, processes simulated or integrated payment, marks service complete.
- **Manager**: Desktop-only user. Oversees all store lanes, reviews live throughput, monitors inventory levels, adjusts pricing/stock, views cashier sales performance.
- **Admin**: Desktop-only user. Configures supermarket stores, registers cashier and manager accounts, sets global operating rules, monitors system health logs.
