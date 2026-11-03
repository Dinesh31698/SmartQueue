const http = require('http');
const { io } = require('socket.io-client');
const { server, startServer } = require('../server');
const config = require('../src/config/environment');

const runVerification = async () => {
  console.log('[Verify] Starting SmartQueue Backend Verification Suite...');
  
  await startServer();

  // Helper for HTTP GET
  const httpGet = (url) => {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      }).on('error', reject);
    });
  };

  try {
    // 1. Verify GET /
    console.log('[Verify] Probing GET / ...');
    const rootRes = await httpGet(`http://localhost:${config.port}/`);
    console.log('[Verify] Root response:', JSON.stringify(rootRes));
    if (rootRes.statusCode !== 200 || rootRes.body.status !== 'ONLINE') {
      throw new Error('GET / did not return expected status.');
    }

    // 2. Verify GET /api/health
    console.log('[Verify] Probing GET /api/health ...');
    const healthRes = await httpGet(`http://localhost:${config.port}/api/health`);
    console.log('[Verify] Health response:', JSON.stringify(healthRes));
    if (healthRes.statusCode !== 200 || !healthRes.body.success) {
      throw new Error('GET /api/health did not return 200.');
    }

    // 3. Verify Socket.IO Client Connection
    console.log('[Verify] Testing Socket.IO connection to server...');
    const socket = io(`http://localhost:${config.port}`, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket.IO connection timed out')), 5000);
      socket.on('connect', () => {
        console.log(`[Verify] Socket.IO Connected successfully! Client ID: ${socket.id}`);
        // Test room joining
        socket.emit('join_store', 'STORE-001');
      });
      socket.on('joined_room', (data) => {
        console.log('[Verify] Socket.IO Room joined confirmed:', JSON.stringify(data));
        socket.disconnect();
        clearTimeout(timeout);
        resolve();
      });
      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log('[Verify] All Server, API & Socket.IO verifications passed successfully!');
  } catch (error) {
    console.error('[Verify] Verification failed:', error);
    process.exit(1);
  } finally {
    server.close(() => {
      console.log('[Verify] Server shut down cleanly.');
      process.exit(0);
    });
  }
};

runVerification();
