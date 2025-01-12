import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';

export const createTestUser = async (dataSource: DataSource, userData: Partial<User> = {}): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  
  const user = userRepository.create({
    email: `test-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    emailVerified: false,
    ...userData
  });

  return userRepository.save(user);
};

export const generateMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  email: `test-${Date.now()}@example.com`,
  firstName: 'Test',
  lastName: 'User',
  emailVerified: false,
  ...overrides
}); 