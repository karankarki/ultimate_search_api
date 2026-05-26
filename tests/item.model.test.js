const itemModel = require('../src/models/itemModel');
const db = require('../src/models/db');

jest.mock('../src/models/db');

describe('Item Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an item and return it', async () => {
      const mockItem = {
        id: 1,
        title: 'Test Item',
        description: 'Test Description',
        created_at: new Date(),
      };
      db.query.mockResolvedValueOnce({ rows: [mockItem] });

      const result = await itemModel.createItem(1, 'Test Item', 'Test Description');

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO items (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description, created_at',
        [1, 'Test Item', 'Test Description']
      );
      expect(result).toEqual(mockItem);
    });
  });

  describe('getPaginatedItems', () => {
    it('should return paginated items with metadata', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total: '100' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, title: 'Item 1', description: 'Desc 1', created_at: new Date() },
          ],
        });

      const result = await itemModel.getPaginatedItems(1, 1, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total', 100);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('pages', 3);
    });
  });

  describe('searchItems', () => {
    it('should search items by title', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 1, title: 'React Item', description: 'Desc', created_at: new Date() }],
        });

      const result = await itemModel.searchItems(1, 'react', 1, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total', 5);
      expect(result.items.length).toBe(1);
    });
  });
});
