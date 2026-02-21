require('dotenv').config({ path: './auth-backend/.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('Connection String:', MONGO_URI ? 'CONFIGURED ✓' : 'MISSING ✗');

if (!MONGO_URI) {
  console.log('❌ ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ MongoDB Connection Failed!');
    console.log('Error:', err.message);
    process.exit(1);
  });
