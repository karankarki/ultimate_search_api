const itemModel = require('../models/itemModel');

const getItems = async (req, res, next) => {
  try {
    const items = await itemModel.getItemsByUserId(req.user.userId);
    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

const getPaginatedItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 40));
    const paginationType = req.query.type || 'offset'; // 'offset' or 'cursor'
    const cursor = req.query.cursor || null;

    let result;
    if (paginationType === 'cursor') {
      result = await itemModel.getPaginatedItemsCursor(req.user.userId, cursor ? parseInt(cursor, 10) : null, limit);
    } else {
      result = await itemModel.getPaginatedItemsOffset(req.user.userId, page, limit);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const searchItems = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 40));
    const paginationType = req.query.type || 'offset'; // 'offset' or 'cursor'
    const cursor = req.query.cursor || null;

    let result;
    if (paginationType === 'cursor') {
      result = await itemModel.searchItemsCursor(req.user.userId, q.trim(), cursor ? parseInt(cursor, 10) : null, limit);
    } else {
      result = await itemModel.searchItemsOffset(req.user.userId, q.trim(), page, limit);
    }

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const item = await itemModel.createItem(req.user.userId, title, description || '');
    return res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getPaginatedItems,
  searchItems,
  addItem,
};
