require('dotenv').config();
const path = require('path');
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
app.use(express.json({ limit: '5mb' })); // invoices/history can grow, keep some headroom

// One resource route per collection the frontend used to keep in localStorage.
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
// Singleton document: categories, statuses, priorities, roles.
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve the frontend (index.html/style.css/script.js) from this same app,
// so the whole CRM lives under one cPanel Node.js App / one domain — no
// separate static hosting, no CORS setup needed.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 EDH CRM running on http://localhost:${PORT}`);
  });
});
