import { generateMockRequest, generateMockResponse, generateMockGoogleProfile } from '../../test/helpers';
import { generateTestToken } from '../../test/setup';
import passport from 'passport';

jest.mock('passport');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /auth/google', () => {
    it('should initiate Google OAuth flow', () => {
      const req = generateMockRequest();
      const res = generateMockResponse();
      const next = jest.fn();

      passport.authenticate('google', {
        scope: ['profile', 'email']
      })(req, res, next);

      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        scope: ['profile', 'email']
      });
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should handle successful Google OAuth callback', () => {
      const req = generateMockRequest();
      const res = generateMockResponse();
      const next = jest.fn();
      const mockProfile = generateMockGoogleProfile();

      passport.authenticate('google', {
        failureRedirect: '/login'
      })(req, res, next);

      // Simulate successful authentication
      req.user = {
        id: 'test-user-id',
        email: mockProfile.emails![0].value
      };

      expect(res.redirect).toHaveBeenCalled();
    });

    it('should handle failed Google OAuth callback', () => {
      const req = generateMockRequest();
      const res = generateMockResponse();
      const next = jest.fn();

      passport.authenticate('google', {
        failureRedirect: '/login'
      })(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('GET /auth/current-user', () => {
    it('should return current user when authenticated', () => {
      const req = generateMockRequest();
      const res = generateMockResponse();
      const userId = 'test-user-id';
      const token = generateTestToken(userId);

      req.headers.authorization = `Bearer ${token}`;
      req.user = { id: userId, email: 'test@example.com' };

      // Call your current user endpoint handler here
      // currentUserHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(req.user);
    });

    it('should return 401 when not authenticated', () => {
      const req = generateMockRequest();
      const res = generateMockResponse();

      // Call your current user endpoint handler here
      // currentUserHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
}); 