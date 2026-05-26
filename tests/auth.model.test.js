const userModel = require('../src/models/userModel');
const db = require('../src/models/db');

jest.mock('../src/models/db');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with session token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', created_at: new Date() };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.createUser('test@example.com', 'hashedpassword', 'token123');

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, password_hash, session_token) VALUES ($1, $2, $3) RETURNING id, email, created_at',
        ['test@example.com', 'hashedpassword', 'token123']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email with session token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password_hash: 'hash', session_token: 'token' };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.findByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, session_token FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await userModel.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id with session token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', session_token: 'token', created_at: new Date() };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, email, session_token, created_at FROM users WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockUser);
    });
  });
});
