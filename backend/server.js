require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── App Setup ───────────────────────────────────────────────────────────────
const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { clerkMiddleware } = require('@clerk/express');
app.use(clerkMiddleware());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
