// Run: node scripts/seed-local-users.js
// Prints a JS snippet you can paste into the browser console to populate localStorage

const sampleUsers = [
  {
    id: 'local_1',
    name: 'Paul Kingsley',
    email: 'paulkingsley357@gmail.com',
    password: 'TestPass123',
    status: 'active',
    createdAt: new Date().toISOString(),
    balance: 1000,
    notifications: [],
    registrationStatus: 'confirmed',
    verified: true
  },
  {
    id: 'local_2',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo',
    status: 'active',
    createdAt: new Date().toISOString(),
    balance: 500,
    notifications: [],
    registrationStatus: 'confirmed',
    verified: true
  }
];

const currentUser = sampleUsers[0];

const snippet = `// Paste this into your browser console on http://localhost:5174/\n` +
`localStorage.setItem('demo_users', JSON.stringify(${JSON.stringify(sampleUsers, null, 2)}));\n` +
`localStorage.setItem('currentUser', JSON.stringify(${JSON.stringify(currentUser, null, 2)}));\n` +
`console.log('✅ demo_users and currentUser set. Refresh the page.');`;

console.log(snippet);

// Also write a JSON file for quick reference
const fs = require('fs');
fs.writeFileSync('scripts/demo_users.json', JSON.stringify(sampleUsers, null, 2));
console.log('\nWrote scripts/demo_users.json');
