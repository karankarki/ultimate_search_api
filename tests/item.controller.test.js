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
    it('should return paginated items', async () => {
      req.query = { page: '1', limit: '40' };
      const mockResult = {
        items: [{ id: 1, title: 'Item 1' }],
        total: 100,
        page: 1,
        pages: 3,
      };

      itemModel.getPaginatedItems.mockResolvedValueOnce(mockResult);

      await itemController.getPaginatedItems(req, res, next);

      expect(itemModel.getPaginatedItems).toHaveBeenCalledWith(1, 1, 40);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should default to page 1 and limit 40', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        pages: 0,
      };

      itemModel.getPaginatedItems.mockResolvedValueOnce(mockResult);

      await itemController.getPaginatedItems(req, res, next);

      expect(itemModel.getPaginatedItems).toHaveBeenCalledWith(1, 1, 40);
    });
  });

  describe('searchItems', () => {
    it('should search items by query', async () => {
      req.query = { q: 'react', page: '1', limit: '40' };
      const mockResult = {
        items: [{ id: 1, title: 'Learn React' }],
        total: 1,
        page: 1,
        pages: 1,
      };

      itemModel.searchItems.mockResolvedValueOnce(mockResult);

      await itemController.searchItems(req, res, next);

      expect(itemModel.searchItems).toHaveBeenCalledWith(1, 'react', 1, 40);
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
