import { DataSource } from 'typeorm';
import { User } from '../user.entity';
import { createTestUser } from '../../test/helpers';

describe('User Entity', () => {
  let dataSource: DataSource;

  beforeAll(() => {
    dataSource = (global as any).testDataSource;
  });

  it('should create a user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: false
    };

    const user = await createTestUser(dataSource, userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.emailVerified).toBe(userData.emailVerified);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should update user fields correctly', async () => {
    const user = await createTestUser(dataSource);
    const userRepository = dataSource.getRepository(User);

    const newFirstName = 'Jane';
    user.firstName = newFirstName;
    await userRepository.save(user);

    const updatedUser = await userRepository.findOneBy({ id: user.id });
    expect(updatedUser?.firstName).toBe(newFirstName);
  });

  it('should store and retrieve JSON preferences correctly', async () => {
    const preferences = {
      theme: 'dark',
      notifications: {
        email: true,
        push: false
      }
    };

    const user = await createTestUser(dataSource, { preferences });
    const userRepository = dataSource.getRepository(User);

    const retrievedUser = await userRepository.findOneBy({ id: user.id });
    expect(retrievedUser?.preferences).toEqual(preferences);
  });

  it('should handle optional avatar URL', async () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    const user = await createTestUser(dataSource, { avatarUrl });

    const userRepository = dataSource.getRepository(User);
    const retrievedUser = await userRepository.findOneBy({ id: user.id });
    expect(retrievedUser?.avatarUrl).toBe(avatarUrl);
  });

  it('should enforce unique email constraint', async () => {
    const email = 'unique@example.com';
    await createTestUser(dataSource, { email });

    await expect(
      createTestUser(dataSource, { email })
    ).rejects.toThrow();
  });
}); 