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

// Offset-based pagination (no count)
const getPaginatedItemsOffset = async (userId, page = 1, limit = 40) => {
  const offset = (page - 1) * limit;

  const itemsResult = await db.query(
    'SELECT id, title, description, created_at FROM items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );

  return {
    items: itemsResult.rows,
    page,
    limit,
    hasMore: itemsResult.rows.length === limit,
  };
};

// Cursor-based pagination (uses item ID as cursor)
const getPaginatedItemsCursor = async (userId, cursor = null, limit = 40) => {
  let query = 'SELECT id, title, description, created_at FROM items WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (cursor) {
    query += ` AND id < $${paramIndex}`;
    params.push(cursor);
    paramIndex++;
  }

  query += ` ORDER BY id DESC LIMIT $${paramIndex}`;
  params.push(limit + 1); // Fetch one extra to determine hasMore

  const result = await db.query(query, params);
  const hasMore = result.rows.length > limit;
  const items = hasMore ? result.rows.slice(0, limit) : result.rows;

  return {
    items,
    nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    hasMore,
    limit,
  };
};

// Keep old function for backward compatibility
const getPaginatedItems = async (userId, page = 1, limit = 40) => {
  return getPaginatedItemsOffset(userId, page, limit);
};

// Offset-based search pagination (no count)
const searchItemsOffset = async (userId, query, page = 1, limit = 40) => {
  const offset = (page - 1) * limit;
  const searchQuery = `%${query}%`;

  const itemsResult = await db.query(
    'SELECT id, title, description, created_at FROM items WHERE user_id = $1 AND title ILIKE $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
    [userId, searchQuery, limit, offset]
  );

  return {
    items: itemsResult.rows,
    page,
    limit,
    hasMore: itemsResult.rows.length === limit,
  };
};

// Cursor-based search pagination
const searchItemsCursor = async (userId, query, cursor = null, limit = 40) => {
  const searchQuery = `%${query}%`;
  let sqlQuery = 'SELECT id, title, description, created_at FROM items WHERE user_id = $1 AND title ILIKE $2';
  const params = [userId, searchQuery];
  let paramIndex = 3;

  if (cursor) {
    sqlQuery += ` AND id < $${paramIndex}`;
    params.push(cursor);
    paramIndex++;
  }

  sqlQuery += ` ORDER BY id DESC LIMIT $${paramIndex}`;
  params.push(limit + 1);

  const result = await db.query(sqlQuery, params);
  const hasMore = result.rows.length > limit;
  const items = hasMore ? result.rows.slice(0, limit) : result.rows;

  return {
    items,
    nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    hasMore,
    limit,
  };
};

// Keep old function for backward compatibility
const searchItems = async (userId, query, page = 1, limit = 40) => {
  return searchItemsOffset(userId, query, page, limit);
};

module.exports = {
  createItem,
  getItemsByUserId,
  getPaginatedItems,
  getPaginatedItemsOffset,
  getPaginatedItemsCursor,
  searchItems,
  searchItemsOffset,
  searchItemsCursor,
};
