const db = require('./db');

const createItem = async (userId, title, description) => {
  const result = await db.query(
    'INSERT INTO items (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description, created_at',
    [userId, title, description]
  );
  return result.rows[0];
};

const getItemsByUserId = async (userId) => {
  const result = await db.query(
    'SELECT id, title, description, created_at FROM items WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const getPaginatedItems = async (userId, page = 1, limit = 40) => {
  const offset = (page - 1) * limit;
  
  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM items WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const itemsResult = await db.query(
    'SELECT id, title, description, created_at FROM items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );

  return {
    items: itemsResult.rows,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

const searchItems = async (userId, query, page = 1, limit = 40) => {
  const offset = (page - 1) * limit;
  const searchQuery = `%${query}%`;

  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM items WHERE user_id = $1 AND title ILIKE $2',
    [userId, searchQuery]
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const itemsResult = await db.query(
    'SELECT id, title, description, created_at FROM items WHERE user_id = $1 AND title ILIKE $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
    [userId, searchQuery, limit, offset]
  );

  return {
    items: itemsResult.rows,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};

module.exports = {
  createItem,
  getItemsByUserId,
  getPaginatedItems,
  searchItems,
};
