// Simple test script to create a user via the user-account-service repository.
// Run from repo root:
//   npx ts-node ./scripts/testCreateUser.ts

// Use dynamic import so ts-node resolves paths correctly (handles spaces/ESM)
(async () => {
  try {
    const mod = await import('../server/user-account-service/src/repositories/user.repository.ts');
    const UserRepository = (mod && (mod.UserRepository || mod.default?.UserRepository));
    if (!UserRepository) {
      throw new Error('Could not load UserRepository from module');
    }
    const repo = new UserRepository();
    const created = await repo.createUser({ username: 'testuser', email: 'test@example.com', password: 'Password123!' } as any);
    console.log('Created user:', created);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exitCode = 1;
  }
})();
