const http = require('http');
const app = require('./src/app');
const config = require('./src/config/environment');
const { connectDB, disconnectDB } = require('./src/config/db');
const { initSocket } = require('./src/sockets/socketManager');

const server = http.createServer(app);

// Initialize Socket.IO with server
initSocket(server, config.corsOrigins);

const startServer = async () => {
  // Connect to Database
  await connectDB();

  server.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(` SmartQueue Backend Server running in [${config.env}]`);
    console.log(` Listening on: http://localhost:${config.port}`);
    console.log(` Health Check: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
};

// Graceful termination handling
const handleShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server and database...`);
  server.close(async () => {
    await disconnectDB();
    console.log('[Shutdown] All connections gracefully closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
