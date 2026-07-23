const path = require('path');
// 1. Ensure .env.local is targeted properly
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const buildResourceRouter = require('./routes/resourceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Model Imports
const Item = require('./models/Item');
const Order = require('./models/Order');
const Expense = require('./models/Expense');
const HistoryEntry = require('./models/HistoryEntry');
const Invoice = require('./models/Invoice');
const User = require('./models/User');
const Task = require('./models/Task');
const StockMove = require('./models/StockMove');
const PasswordRequest = require('./models/PasswordRequest');
const PhotoRequest = require('./models/PhotoRequest');

const app = express();

// Security & Parsing Middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : '*';

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// API Resource Routes
app.use('/api/items', buildResourceRouter(Item));
app.use('/api/orders', buildResourceRouter(Order));
app.use('/api/expenses', buildResourceRouter(Expense));
app.use('/api/history', buildResourceRouter(HistoryEntry));
app.use('/api/invoices', buildResourceRouter(Invoice));
app.use('/api/users', buildResourceRouter(User));
app.use('/api/tasks', buildResourceRouter(Task));
app.use('/api/stockmoves', buildResourceRouter(StockMove));
app.use('/api/passwordrequests', buildResourceRouter(PasswordRequest));
app.use('/api/photorequests', buildResourceRouter(PhotoRequest));
app.use('/api/settings', settingsRoutes);

// Health Check Route
app.get('/api/health', (req, res) => res.status(200).json({ ok: true, timestamp: new Date() }));

// Static Frontend Serving & SPA Catch-All
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`🚀 EDH CRM running on port ${PORT}`);
    });

    // Graceful Shutdown on SIGTERM (Common in Hosting Environments like cPanel / Hostinger)
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });

  } catch (error) {
    console.error('❌ Database connection failed. Server not started:', error.message);
    process.exit(1);
  }
}

startServer();

// Global Process Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});