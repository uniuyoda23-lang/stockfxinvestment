import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';

const app = express();

// ============================================================================
// Config (from .env or defaults)
// ============================================================================
const GATEWAY_PORT = process.env.GATEWAY_PORT || 4000;
const GATEWAY_HOST = process.env.GATEWAY_HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
const DASHBOARD_SERVICE_URL = process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3001';
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3002';
const OTP_SERVICE_URL = process.env.OTP_SERVICE_URL || 'http://localhost:3003';

const CORS_ORIGIN = process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'];
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

// ============================================================================
// Middleware
// ============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'common' : 'combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// ============================================================================
// Routes & Proxies
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Service status endpoint
app.get('/api/services', (req, res) => {
  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      dashboard: DASHBOARD_SERVICE_URL,
      account: ACCOUNT_SERVICE_URL,
      otp: OTP_SERVICE_URL,
    },
  });
});

// API Proxy Routes
// - Authentication & Login
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '', // Remove /api/auth prefix before proxying
    },
    onError: (err, req, res) => {
      console.error('Auth service error:', err.message);
      res.status(503).json({ error: 'Auth service unavailable' });
    },
  })
);

// - Dashboard
app.use(
  '/api/dashboard',
  createProxyMiddleware({
    target: DASHBOARD_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/dashboard': '',
    },
    onError: (err, req, res) => {
      console.error('Dashboard service error:', err.message);
      res.status(503).json({ error: 'Dashboard service unavailable' });
    },
  })
);

// - Account Management
app.use(
  '/api/account',
  createProxyMiddleware({
    target: ACCOUNT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/account': '',
    },
    onError: (err, req, res) => {
      console.error('Account service error:', err.message);
      res.status(503).json({ error: 'Account service unavailable' });
    },
  })
);

// - OTP & Email
app.use(
  '/api/otp',
  createProxyMiddleware({
    target: OTP_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/otp': '',
    },
    onError: (err, req, res) => {
      console.error('OTP service error:', err.message);
      res.status(503).json({ error: 'OTP service unavailable' });
    },
  })
);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// Server Start
// ============================================================================

app.listen(GATEWAY_PORT, GATEWAY_HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         StockFX Gateway / Firewall Started             ║
╠════════════════════════════════════════════════════════╣
║ Status:   🟢 Running                                   ║
║ Port:     ${GATEWAY_PORT}                                   ║
║ Host:     ${GATEWAY_HOST}                                   ║
║ URL:      http://${GATEWAY_HOST}:${GATEWAY_PORT}                      ║
║ Env:      ${NODE_ENV}                                   ║
╠════════════════════════════════════════════════════════╣
║ Backend Services:                                      ║
║  • Auth:       ${AUTH_SERVICE_URL}     ║
║  • Dashboard:  ${DASHBOARD_SERVICE_URL}     ║
║  • Account:    ${ACCOUNT_SERVICE_URL}     ║
║  • OTP:        ${OTP_SERVICE_URL}     ║
╠════════════════════════════════════════════════════════╣
║ Routes:                                                ║
║  GET  /health           → Gateway health               ║
║  GET  /api/services     → Service status               ║
║  POST /api/auth/*       → Auth service                 ║
║  GET  /api/dashboard/*  → Dashboard service            ║
║  POST /api/account/*    → Account service              ║
║  POST /api/otp/*        → OTP service                  ║
╚════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
