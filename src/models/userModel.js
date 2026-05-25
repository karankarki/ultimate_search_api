const db = require('./db');

const createUser = async (email, passwordHash, sessionToken) => {
  const result = await db.query(
    'INSERT INTO users (email, password_hash, session_token) VALUES ($1, $2, $3) RETURNING id, email, created_at',
    [email, passwordHash, sessionToken]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query('SELECT id, email, password_hash, session_token FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query('SELECT id, email, session_token, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const updateSessionToken = async (id, sessionToken) => {
  const result = await db.query('UPDATE users SET session_token = $1 WHERE id = $2 RETURNING id', [sessionToken, id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateSessionToken,
};
