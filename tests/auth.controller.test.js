const authController = require('../src/controllers/authController');
const userModel = require('../src/models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user with session token', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com' };

      userModel.findByEmail.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedpassword');
      userModel.createUser.mockResolvedValueOnce(mockUser);

      await authController.signup(req, res, next);

      expect(userModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userModel.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'hashedpassword',
        expect.any(String)
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return error if email already exists', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };

      userModel.findByEmail.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });

      await authController.signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return error if email or password missing', async () => {
      req.body = { email: 'test@example.com' };

      await authController.signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com', password_hash: 'hashedpassword' };

      userModel.findByEmail.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('token123');

      await authController.login(req, res, next);

      expect(userModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token123' }));
    });

    it('should return error if user not found', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'password123' };

      userModel.findByEmail.mockResolvedValueOnce(null);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return error if password is invalid', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = { id: 1, email: 'test@example.com', password_hash: 'hashedpassword' };

      userModel.findByEmail.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
