const itemController = require('../src/controllers/itemController');
const itemModel = require('../src/models/itemModel');

jest.mock('../src/models/itemModel');

describe('Item Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      user: { userId: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getPaginatedItems', () => {
    it('should return paginated items with offset type', async () => {
      req.query = { page: '1', limit: '40', type: 'offset' };
      const mockResult = {
        items: [{ id: 1, title: 'Item 1' }],
        page: 1,
        limit: 40,
        hasMore: true,
      };

      itemModel.getPaginatedItemsOffset.mockResolvedValueOnce(mockResult);

      await itemController.getPaginatedItems(req, res, next);

      expect(itemModel.getPaginatedItemsOffset).toHaveBeenCalledWith(1, 1, 40);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return paginated items with cursor type', async () => {
      req.query = { cursor: '5', limit: '40', type: 'cursor' };
      const mockResult = {
        items: [{ id: 4, title: 'Item 4' }],
        nextCursor: 3,
        hasMore: true,
        limit: 40,
      };

      itemModel.getPaginatedItemsCursor.mockResolvedValueOnce(mockResult);

      await itemController.getPaginatedItems(req, res, next);

      expect(itemModel.getPaginatedItemsCursor).toHaveBeenCalledWith(1, 5, 40);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should default to offset type with page 1 and limit 40', async () => {
      const mockResult = {
        items: [],
        page: 1,
        limit: 40,
        hasMore: false,
      };

      itemModel.getPaginatedItemsOffset.mockResolvedValueOnce(mockResult);

      await itemController.getPaginatedItems(req, res, next);

      expect(itemModel.getPaginatedItemsOffset).toHaveBeenCalledWith(1, 1, 40);
    });
  });

  describe('searchItems', () => {
    it('should search items by query with offset type', async () => {
      req.query = { q: 'react', page: '1', limit: '40', type: 'offset' };
      const mockResult = {
        items: [{ id: 1, title: 'Learn React' }],
        page: 1,
        limit: 40,
        hasMore: false,
      };

      itemModel.searchItemsOffset.mockResolvedValueOnce(mockResult);

      await itemController.searchItems(req, res, next);

      expect(itemModel.searchItemsOffset).toHaveBeenCalledWith(1, 'react', 1, 40);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should search items by query with cursor type', async () => {
      req.query = { q: 'react', cursor: '10', limit: '40', type: 'cursor' };
      const mockResult = {
        items: [{ id: 9, title: 'React Hooks' }],
        nextCursor: 8,
        hasMore: true,
        limit: 40,
      };

      itemModel.searchItemsCursor.mockResolvedValueOnce(mockResult);

      await itemController.searchItems(req, res, next);

      expect(itemModel.searchItemsCursor).toHaveBeenCalledWith(1, 'react', 10, 40);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return error if query is missing', async () => {
      req.query = { page: '1' };

      await itemController.searchItems(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe('addItem', () => {
    it('should create a new item', async () => {
      req.body = { title: 'New Item', description: 'New Description' };
      const mockItem = { id: 1, title: 'New Item', description: 'New Description' };

      itemModel.createItem.mockResolvedValueOnce(mockItem);

      await itemController.addItem(req, res, next);

      expect(itemModel.createItem).toHaveBeenCalledWith(1, 'New Item', 'New Description');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ item: mockItem });
    });

    it('should return error if title is missing', async () => {
      req.body = { description: 'Description' };

      await itemController.addItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle empty description', async () => {
      req.body = { title: 'New Item' };
      const mockItem = { id: 1, title: 'New Item', description: '' };

      itemModel.createItem.mockResolvedValueOnce(mockItem);

      await itemController.addItem(req, res, next);

      expect(itemModel.createItem).toHaveBeenCalledWith(1, 'New Item', '');
    });
  });
});
