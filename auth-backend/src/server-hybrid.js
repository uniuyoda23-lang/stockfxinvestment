require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DB_FILE = path.join(__dirname, '../users.json');

// ============================================
// Dual Storage: MongoDB or File-based
// ============================================

let useMongoose = false;
let User = null;

// Try to use MongoDB if connection string is provided
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('✅ MongoDB connected - using cloud database');
      useMongoose = true;
      
      // Define User schema
      const userSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String },
        balance: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
      });
      
      User = mongoose.model('User', userSchema);
    })
    .catch(err => {
      console.warn('⚠️  MongoDB connection failed, falling back to file storage:', err.message);
      useMongoose = false;
    });
} else {
  console.log('ℹ️  No MONGODB_URI provided - using file-based storage');
}

// ============================================
// File-based Storage Functions
// ============================================

function loadUsers() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading users from file:', err.message);
  }
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users to file:', err.message);
  }
}

// ============================================
// Unified User Management Functions
// ============================================

async function findUserByEmail(email) {
  if (useMongoose && User) {
    return await User.findOne({ email });
  }
  const users = loadUsers();
  return users.find(u => u.email === email);
}

async function findUserById(id) {
  if (useMongoose && User) {
    return await User.findById(id);
  }
  const users = loadUsers();
  return users.find(u => u.id === id);
}

async function createUser(userData) {
  if (useMongoose && User) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      email: userData.email,
      password: hashedPassword,
      name: userData.name || userData.email,
      balance: 0,
    });
    return await newUser.save();
  }
  
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = {
    id: Date.now().toString(),
    email: userData.email,
    name: userData.name || userData.email,
    password: hashedPassword,
    balance: 0,
    createdAt: new Date().toISOString()
  };
  const users = loadUsers();
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

async function getAllUsers() {
  if (useMongoose && User) {
    return await User.find({}, '-password');
  }
  const users = loadUsers();
  return users.map(u => ({ ...u, password: undefined }));
}

async function updateUserBalance(userId, amount) {
  if (useMongoose && User) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.balance = (user.balance || 0) + amount;
    await user.save();
    return user;
  }
  
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  user.balance = (user.balance || 0) + amount;
  saveUsers(users);
  return user;
}

async function updateUserName(userId, name) {
  if (useMongoose && User) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    user.name = name;
    await user.save();
    return user;
  }
  
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  user.name = name;
  saveUsers(users);
  return user;
}

// ============================================
// API Routes
// ============================================

// Register endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const newUser = await createUser({ email, password, name });

    const token = jwt.sign({ 
      id: newUser._id || newUser.id, 
      email: newUser.email 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id || newUser.id,
        email: newUser.email,
        name: newUser.name,
        balance: newUser.balance
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: user._id || user.id, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: useMongoose ? 'MongoDB' : 'File-based'
  });
});

// List users (admin)
app.get('/auth/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      users: users.map(u => ({
        id: u._id || u.id,
        email: u.email,
        name: u.name,
        balance: u.balance,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update balance (admin)
app.post('/auth/user/balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await updateUserBalance(userId, amount);
    res.json({ 
      message: 'Balance updated', 
      balance: user.balance 
    });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit name (admin)
app.post('/auth/user/name', async (req, res) => {
  try {
    const { userId, name } = req.body;
    const user = await updateUserName(userId, name);
    res.json({ 
      message: 'Name updated', 
      name: user.name 
    });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send notification (admin)
app.post('/auth/user/notify', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: `Notification sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  const dbType = useMongoose ? 'MongoDB' : 'File-based storage';
  console.log(`✅ Auth server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${dbType}`);
});
