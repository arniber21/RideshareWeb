import { DataSource } from 'typeorm';
import { Request, Response } from 'express';
import { UserController } from '../user.controller';
import { createTestUser, generateMockUser } from '../../test/helpers';

describe('UserController', () => {
  let dataSource: DataSource;
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeAll(() => {
    dataSource = (global as any).testDataSource;
    userController = new UserController();
  });

  beforeEach(() => {
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse as Response;
      })
    };
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const userData = generateMockUser();
      mockRequest = {
        body: userData
      };

      await userController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.email).toBe(userData.email);
      expect(responseObject.firstName).toBe(userData.firstName);
      expect(responseObject.lastName).toBe(userData.lastName);
      expect(responseObject.id).toBeDefined();
    });

    it('should reject creation with invalid data', async () => {
      mockRequest = {
        body: { firstName: 'Test' } // Missing required fields
      };

      await expect(
        userController.create(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1 = await createTestUser(dataSource);
      const user2 = await createTestUser(dataSource);

      mockRequest = {};
      await userController.findAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Array.isArray(responseObject)).toBe(true);
      expect(responseObject.length).toBeGreaterThanOrEqual(2);
      expect(responseObject.map((u: any) => u.id)).toContain(user1.id);
      expect(responseObject.map((u: any) => u.id)).toContain(user2.id);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = await createTestUser(dataSource);
      mockRequest = {
        params: { id: user.id }
      };

      await userController.findOne(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.id).toBe(user.id);
      expect(responseObject.email).toBe(user.email);
    });

    it('should return 404 for non-existent user', async () => {
      mockRequest = {
        params: { id: 'non-existent-id' }
      };

      await userController.findOne(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('update', () => {
    it('should update user with valid data', async () => {
      const user = await createTestUser(dataSource);
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      mockRequest = {
        params: { id: user.id },
        body: updateData
      };

      await userController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.firstName).toBe(updateData.firstName);
      expect(responseObject.lastName).toBe(updateData.lastName);
      expect(responseObject.id).toBe(user.id);
    });

    it('should return 404 for updating non-existent user', async () => {
      mockRequest = {
        params: { id: 'non-existent-id' },
        body: { firstName: 'Test' }
      };

      await userController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      const user = await createTestUser(dataSource);
      mockRequest = {
        params: { id: user.id }
      };

      await userController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);

      // Verify user is deleted
      mockRequest = {
        params: { id: user.id }
      };
      await userController.findOne(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 for deleting non-existent user', async () => {
      mockRequest = {
        params: { id: 'non-existent-id' }
      };

      await userController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
}); 