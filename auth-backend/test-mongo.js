require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('\n🧪 Testing MongoDB Connection...\n');
console.log('Connection String Set:', MONGO_URI ? '✅ YES' : '❌ NO');

if (!MONGO_URI) {
  console.log('\n❌ ERROR: MONGO_URI is not configured in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB...\n');

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 8000
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB is connected!\n');
    console.log('Database Name:', mongoose.connection.name || 'default');
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    console.log('State:', mongoose.connection.readyState === 1 ? 'CONNECTED' : 'UNKNOWN');
    console.log('\n✨ Your MongoDB connection is working correctly!\n');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ FAILED! MongoDB connection error:\n');
    console.log('Error Type:', err.name);
    console.log('Error Message:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MONGODB_URI in .env.local');
    console.log('3. Check MongoDB Atlas cluster is active');
    console.log('4. Verify IP address is whitelisted in MongoDB Atlas\n');
    process.exit(1);
  });
