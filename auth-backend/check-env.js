require('dotenv').config();

console.log('\n📋 Environment Variables Status:\n');
console.log('MONGO_URI:', process.env.MONGO_URI || 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

const chosenURI = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('\n🔗 Will use:', chosenURI ? 'MongoDB Atlas' : 'FALLBACK (localhost)');
if (chosenURI) {
  // Mask the password in the connection string for display
  const masked = chosenURI.replace(/:[^:@]*@/, ':****@');
  console.log('Connection String:', masked);
}
