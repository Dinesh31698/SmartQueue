const mongoose = require('mongoose');
const config = require('./environment');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection attempt failed: ${error.message}`);
    console.warn('[Database Warning] System operating in disconnected/fallback mode. Verify MONGODB_URI.');
    isConnected = false;
    return null;
  }
};

const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
  };
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB Disconnected.');
  }
};

module.exports = {
  connectDB,
  getDBStatus,
  disconnectDB,
};
