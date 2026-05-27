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

  describe('getPaginatedItemsOffset', () => {
    it('should return offset paginated items', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Item 1', description: 'Desc 1', created_at: new Date() },
          { id: 2, title: 'Item 2', description: 'Desc 2', created_at: new Date() },
        ],
      });

      const result = await itemModel.getPaginatedItemsOffset(1, 1, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 40);
      expect(result).toHaveProperty('hasMore', false);
    });

    it('should set hasMore=true when exactly limit items returned', async () => {
      const items = Array(40).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        description: 'Desc',
        created_at: new Date(),
      }));

      db.query.mockResolvedValueOnce({ rows: items });

      const result = await itemModel.getPaginatedItemsOffset(1, 1, 40);

      expect(result.hasMore).toBe(true); // Got exactly limit, so there might be more
    });
  });

  describe('getPaginatedItemsCursor', () => {
    it('should return cursor paginated items', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 50, title: 'Item 50', description: 'Desc', created_at: new Date() },
          { id: 49, title: 'Item 49', description: 'Desc', created_at: new Date() },
        ],
      });

      const result = await itemModel.getPaginatedItemsCursor(1, null, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('nextCursor');
      expect(result).toHaveProperty('hasMore', false);
    });

    it('should use cursor to get next page', async () => {
      const items = Array(40).fill(null).map((_, i) => ({
        id: 100 - i,
        title: `Item ${100 - i}`,
        description: 'Desc',
        created_at: new Date(),
      }));

      db.query.mockResolvedValueOnce({ rows: items });

      const result = await itemModel.getPaginatedItemsCursor(1, 101, 40);

      expect(result.items.length).toBe(40);
      expect(result.nextCursor).toBe(items[39].id);
    });
  });

  describe('searchItemsOffset', () => {
    it('should search items with offset pagination', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'React Item', description: 'Desc', created_at: new Date() },
          { id: 2, title: 'React Native', description: 'Desc', created_at: new Date() },
        ],
      });

      const result = await itemModel.searchItemsOffset(1, 'react', 1, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 40);
      expect(result).toHaveProperty('hasMore', false);
      expect(result.items.length).toBe(2);
    });
  });

  describe('searchItemsCursor', () => {
    it('should search items with cursor pagination', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 50, title: 'React Item', description: 'Desc', created_at: new Date() },
          { id: 49, title: 'React Native', description: 'Desc', created_at: new Date() },
        ],
      });

      const result = await itemModel.searchItemsCursor(1, 'react', null, 40);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('nextCursor');
      expect(result).toHaveProperty('hasMore', false);
    });
  });
});
