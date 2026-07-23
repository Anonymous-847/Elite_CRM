const mongoose = require('mongoose');

// Cache object across re-renders / serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Environment variable validation
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside your .env.local file'
    );
  }

  // Return existing active connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none is in progress
  if (!cached.promise) {
    const opts = {
      dbName: 'Elite_Digital_CRM',
      bufferCommands: false, // Prevent queries from hanging if the connection drops
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✓ MongoDB Atlas Connected Successfully!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on failure so next request can attempt retry
    console.error('❌ MongoDB Connection Failure:', error.message);
    throw error;
  }
}

// Graceful application shutdown
process.on('SIGINT', async () => {
  if (cached.conn) {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed due to app termination');
    process.exit(0);
  }
});

module.exports = connectDB;