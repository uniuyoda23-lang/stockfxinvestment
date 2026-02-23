import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import supabase, { dbUser, dbUserAccount, dbSession } from '../lib/sharedDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = process.env.PORT || 3000;

// No local DB initialization required — using centralized Supabase via `lib/sharedDb.js`

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS: in development, allow any origin (echo) to avoid 'failed to fetch' during local dev.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  // Replace with your production origin(s)
  app.use(cors({ origin: ['https://your-production-origin.com'], credentials: true }));
}

// Simple request logging to make debugging network issues easier
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const normalized = email.toLowerCase().trim();
  try {
    const existing = await dbUser.findByEmail(normalized);
    if (existing) return res.status(409).json({ error: 'A user with that email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await dbUser.create(normalized, hash, name);
    // Ensure a user account row exists
    await dbUserAccount.create(user.id, 0);
    const token = createToken(user);
    // Persist session server-side for revocation/inspection
    try { await dbSession.create(user.id, token, 24 * 7); } catch (e) { console.warn('Failed to persist session:', e.message); }
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const normalized = email.toLowerCase().trim();
  try {
    const user = await dbUser.findByEmail(normalized);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const storedHash = user.password_hash || user.passwordHash || '';
    const ok = await bcrypt.compare(password, storedHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = createToken(user);
    try { await dbSession.create(user.id, token, 24 * 7); } catch (e) { console.warn('Failed to persist session:', e.message); }
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const data = jwt.verify(token, JWT_SECRET);
    const user = await dbUser.findById(data.id);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const { password_hash, passwordHash, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (e) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
});

// Dev-only: list users (no password hashes) to help debug registration/storage
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/users', async (req, res) => {
    try {
      const users = await dbUser.list(100, 0);
      const safe = users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at || u.createdAt }));
      res.json({ users: safe });
    } catch (e) {
      res.status(500).json({ error: 'Failed to list users' });
    }
  });
}

app.post('/api/logout', (req, res) => {
  const token = req.cookies.token;
  res.clearCookie('token');
  if (!token) return res.json({ ok: true });
  (async () => {
    try {
      const session = await dbSession.findByToken(token);
      if (session) await dbSession.delete(session.id);
    } catch (e) {
      console.warn('Failed to remove session:', e.message);
    }
  })();
  res.json({ ok: true });
});

const HOST = process.env.HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => console.log('Auth server listening on', HOST + ':' + PORT));
server.on('error', (err) => {
  console.error('Server listen error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
server.on('error', (err) => {
  console.error('Server listen error:', err);
  process.exit(1);
});
