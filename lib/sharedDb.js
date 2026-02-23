/**
 * Centralized sharedDb stub (lib/sharedDb.js)
 *
 * This is a minimal, replaceable stub that provides the named exports
 * used throughout the repo (`dbUser`, `dbUserAccount`, etc.). Replace
 * with your real Supabase implementation when available.
 */

const supabase = null;

const makeUserApi = (name) => ({
  async create(email, password) {
    return { id: `${name}-id`, email, password };
  },
  async findById(id) {
    return null;
  },
  async findByEmail(email) {
    return null;
  },
  async update(id, data) {
    return { id, ...data };
  },
});

const dbUser = makeUserApi('user');
const dbUserAccount = makeUserApi('userAccount');
const dbTransaction = makeUserApi('transaction');
const dbPortfolio = makeUserApi('portfolio');

const dbOtp = {
  async create(code, userId) {
    return { id: 'otp-id', code, userId };
  },
  async verify(code) {
    return false;
  },
};

const dbSession = {
  async create(userId) {
    return { id: 'session-id', userId };
  },
  async findById(id) {
    return null;
  },
};

export default supabase;
export { dbUser, dbUserAccount, dbTransaction, dbPortfolio, dbOtp, dbSession };
