
import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { dbUser, dbUserAccount } from '../lib/sharedDb.js';

const app = express();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Reset all users' balances to zero
app.post('/reset-balances', async (req, res) => {
  try {
    const users = await dbUser.list(1000, 0);
    for (const user of users) {
      await dbUserAccount.updateBalance(user.id, 0);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset balances' });
  }
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const existing = await dbUser.findByEmail(email.toLowerCase().trim());
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await dbUser.create(email.toLowerCase().trim(), hash, name);
    await dbUserAccount.create(user.id, 0);
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await dbUser.findByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const storedHash = user.password_hash || user.passwordHash || '';
    const valid = await bcrypt.compare(password, storedHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard endpoint
app.get('/dashboard', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await dbUser.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, passwordHash, ...publicUser } = user;
    const account = await dbUserAccount.getByUserId(decoded.id);
    res.json({ user: { ...publicUser, balance: account?.balance || 0 } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => console.log(`Dashboard backend listening on ${HOST}:${PORT}`));
