require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const buildResourceRouter = require('./routes/resourceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const Item = require('./models/Item');
const Order = require('./models/Order');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const HistoryEntry = require('./models/HistoryEntry');
const Invoice = require('./models/Invoice');
const User = require('./models/User');
const Task = require('./models/Task');
const StockMove = require('./models/StockMove');
const PasswordRequest = require('./models/PasswordRequest');
const PhotoRequest = require('./models/PhotoRequest');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));

// API Routes
app.use('/api/items', buildResourceRouter(Item));
app.use('/api/orders', buildResourceRouter(Order));
app.use('/api/expenses', buildResourceRouter(Expense));
app.use('/api/incomes', buildResourceRouter(Income));
app.use('/api/history', buildResourceRouter(HistoryEntry));
app.use('/api/invoices', buildResourceRouter(Invoice));
app.use('/api/users', buildResourceRouter(User));
app.use('/api/tasks', buildResourceRouter(Task));
app.use('/api/stockmoves', buildResourceRouter(StockMove));
app.use('/api/passwordrequests', buildResourceRouter(PasswordRequest));
app.use('/api/photorequests', buildResourceRouter(PhotoRequest));
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- FRONTEND STATIC SERVING ---
// Adjust 'frontend' below to 'frontend/dist' or 'frontend/build' if needed
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Diagnostic check on startup
if (fs.existsSync(FRONTEND_DIR)) {
  console.log(`📁 Frontend directory found at: ${FRONTEND_DIR}`);
  console.log(`📂 Contents of frontend dir:`, fs.readdirSync(FRONTEND_DIR));
} else {
  console.error(`❌ Frontend directory DOES NOT EXIST at: ${FRONTEND_DIR}`);
}

app.use(express.static(FRONTEND_DIR));

app.get(/^\/(?!api\/).*/, (req, res) => {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error attempting to send: ${indexPath}`);
      res.status(404).send(`index.html not found at expected path: ${indexPath}`);
    }
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 EDH CRM running on http://localhost:${PORT}`);
  });
});