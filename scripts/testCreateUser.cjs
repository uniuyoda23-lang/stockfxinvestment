#!/usr/bin/env node
// Bootstrap for running the TypeScript test script under Node's CommonJS loader.
require('ts-node').register({ transpileOnly: true });

try {
  const mod = require('../server/user-account-service/src/repositories/user.repository.ts');
  const UserRepository = mod && (mod.UserRepository || mod.default?.UserRepository);
  if (!UserRepository) throw new Error('Could not load UserRepository from module');

  (async () => {
    try {
      const repo = new UserRepository();
      const created = await repo.createUser({ username: 'testuser', email: 'test@example.com', password: 'Password123!' });
      console.log('Created user:', created);
    } catch (err) {
      console.error('Error creating user:', err);
      process.exitCode = 1;
    }
  })();
} catch (err) {
  console.error('Bootstrap error:', err);
  process.exitCode = 1;
}
